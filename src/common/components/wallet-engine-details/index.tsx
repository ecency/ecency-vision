import React from "react";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { Transactions } from "../../store/transactions/types";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import HiveEngineToken from "../../helper/hive-engine-wallet";
import Transfer, { TransferMode } from "../transfer-he";
import { error, success } from "../feedback";
import DropDown from "../dropdown";
import { EngineTransactionList } from "../hive-engine-transactions";
import {
  claimRewards,
  getHiveEngineTokenBalances,
  getUnclaimedRewards,
  TokenStatus
} from "../../api/hive-engine";
import { plusCircle } from "../../img/svg";
import { formatError } from "../../api/operations";
import formattedNumber from "../../util/formatted-number";
import { _t } from "../../i18n";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  account: Account;
  activeUser: ActiveUser | null;
  transactions: Transactions;
  signingKey: string;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
  setSigningKey: (key: string) => void;
  fetchPoints: (username: string, type?: number) => void;
  updateWalletValues: () => void;
}

interface State {
  tokens: HiveEngineToken[];
  utokens: HiveEngineToken[];
  rewards: TokenStatus[];
  loading: boolean;
  claiming: boolean;
  claimed: boolean;
  transfer: boolean;
  transferMode: null | TransferMode;
  transferAsset: null | string;
  assetBalance: number;
  allTokens: any;
}

export class EngineTokenDetails extends BaseComponent<Props, State> {
  state: State = {
    tokens: [],
    utokens: [],
    rewards: [],
    loading: true,
    claiming: false,
    claimed: false,
    transfer: false,
    transferMode: null,
    transferAsset: null,
    assetBalance: 0,
    allTokens: null
  };
  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.fetch();
    this._isMounted && this.fetchUnclaimedRewards();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  openTransferDialog = (mode: TransferMode, asset: string, balance: number) => {
    this.stateSet({
      transfer: true,
      transferMode: mode,
      transferAsset: asset,
      assetBalance: balance
    });
  };

  closeTransferDialog = () => {
    this.stateSet({ transfer: false, transferMode: null, transferAsset: null });
  };

  fetch = async () => {
    const { account } = this.props;

    this.setState({ loading: true });
    let items;
    try {
      items = await getHiveEngineTokenBalances(account.name);
      this.setState({ utokens: items });
      items = items.filter((token) => token.balance !== 0 || token.stakedBalance !== 0);
      items = this.sort(items);
      this._isMounted && this.setState({ tokens: items });
    } catch (e) {
      console.log("engine tokens", e);
    }

    this.setState({ loading: false });
  };

  sort = (items: HiveEngineToken[]) =>
    items.sort((a: HiveEngineToken, b: HiveEngineToken) => {
      if (a.balance !== b.balance) {
        return a.balance < b.balance ? 1 : -1;
      }

      if (a.stake !== b.stake) {
        return a.stake < b.stake ? 1 : -1;
      }

      return a.symbol > b.symbol ? 1 : -1;
    });

  fetchUnclaimedRewards = async () => {
    const { account } = this.props;
    try {
      const rewards = await getUnclaimedRewards(account.name);
      this._isMounted && this.setState({ rewards });
    } catch (e) {
      console.log("fetchUnclaimedRewards", e);
    }
  };

  claimRewards = (tokens: TokenStatus[]) => {
    const { activeUser } = this.props;
    const { claiming } = this.state;

    if (claiming || !activeUser) {
      return;
    }

    this.setState({ claiming: true });

    return claimRewards(
      activeUser.username,
      tokens.map((t) => t.symbol)
    )
      .then((account) => {
        success(_t("wallet.claim-reward-balance-ok"));
      })
      .then(() => {
        this.setState({ rewards: [] });
      })
      .catch((err) => {
        console.log(err);
        error(...formatError(err));
      })
      .finally(() => {
        this.setState({ claiming: false });
      });
  };

  render() {
    const { global, account, activeUser } = this.props;
    const { rewards, tokens, loading, claiming, claimed } = this.state;
    const hasUnclaimedRewards = rewards.length > 0;
    const isMyPage = activeUser && activeUser.username === account.name;
    let rewardsToShowInTooltip = [...rewards];
    rewardsToShowInTooltip = rewardsToShowInTooltip.splice(0, 10);
    
    const params: string = window.location.href.split('/')[5];

    if (!account.__loaded) {
      return null;
    }

    return  (
     <div className="wallet-hive-engine">
        <div className="wallet-main">
          <div className="wallet-info">
          {hasUnclaimedRewards && (
              <div className="unclaimed-rewards">
                {rewards?.map((r, i) => {
                  const reward: any = r?.pending_token / Math.pow(10, r?.precision);                    
                  return ( r?.symbol === params?.toUpperCase() &&
                  <div key={i}>
                    <div className="title">{_t("wallet.unclaimed-rewards")}</div>
                    <div className="rewards">                        
                       <span className="reward-type">
                          {reward < 0.0001
                            ? `${reward} ${r?.symbol}`
                            : formattedNumber(reward, {
                                fractionDigits: r?.precision,
                                suffix: r?.symbol
                              })}
                        </span>
                        {isMyPage && (
                          <a
                            className={`claim-btn ${claiming ? "in-progress" : ""}`}
                            onClick={() => this.claimRewards([r])}
                          >
                            {plusCircle}
                          </a>
                        )}
                    </div>
                  </div>
                    );
                  })}              
              </div>
            )}

            {tokens.map((t, i) => {
                return ( t?.symbol === params?.toUpperCase() && 
                <div key={i}>
                <div className="balance-row hive">
                      <div className="balance-info">
                        <div className="title">{t?.symbol}</div>
                        <div className="description">
                            {t?.symbol} are tradeable tokens that may be transferred at anytime. 
                            {t?.symbol} can be converted to {t?.symbol} POWER in a process called powering unstake.
                        </div>
                      </div>
                      <div className="balance-values">
                        <div className="amount">
                          {(() => {
                            let dropDownConfig: any;
                            if (isMyPage) { 
                              dropDownConfig = {
                                // history: this.props.history,
                                label: "",
                                items: [
                                  {
                                    label: "Transfer",
                                    onClick: () => {
                                        this.openTransferDialog("transfer", t?.symbol, t?.balance)
                                    }
                                  },
                                  {
                                    label: "Stake",
                                    onClick: () => {
                                        this.openTransferDialog("stake", t?.symbol, t?.balance)
                                    }
                                  },
                                  {
                                    label: "Trade",
                                    onClick: () => {
                                    //   this.openTransferDialog("power-up", "HIVE");
                                    }
                                  }
                                ]
                              };
                            } 
                            else if (activeUser) {
                              dropDownConfig = {
                                // history: this.props.history,
                                label: "",
                                items: [
                                  {
                                    label: "Transfer",
                                    onClick: () => {
                                        this.openTransferDialog("transfer", t?.symbol, t?.balance)
                                    }
                                  }
                                ]
                              };
                            }
                            return (
                              <div className="amount-actions">
                                <DropDown {...dropDownConfig} float="right" />
                              </div>
                            );
                          })()}        
                          <span>{t?.balance}</span>
                        </div>
                      </div>
                </div>

                <div className="balance-row hive-power alternative">
                <div className="balance-info">
                <div className="title">{t?.symbol} POWER</div>
                <div className="description">
                    Amount of hive engine token ({t.symbol}) staked. It can also be delegated to other users
                </div>
              </div>

              <div className="balance-values">
                <div className="amount">
                  {(() => {
                    let dropDownConfig: any;
                    if (isMyPage) {
                      dropDownConfig = {
                        label: "",
                        items: [
                          {
                            label: "Stake",
                            onClick: () => {
                                this.openTransferDialog("stake", t?.symbol, t?.balance)
                            }
                          },
                          {
                            label: "Unstake",
                            onClick: () => {
                                this.openTransferDialog(
                                    "unstake",
                                    t?.symbol,
                                    t?.stakedBalance
                                  )
                            }
                          },
                          {
                            label: "Delegate",
                            onClick: () => {
                                this.openTransferDialog(
                                    "delegate",
                                    t?.symbol,
                                    t?.balance - t?.delegationsOut
                                  )
                            }
                          },
                          {
                            label: "Undelegate",
                            onClick: () => {
                                this.openTransferDialog(
                                    "undelegate",
                                    t.symbol,
                                    t.delegationsOut
                                  )
                            }
                          }
                        ]
                      };
                    } else if (activeUser) {
                      dropDownConfig = {
                        label: "",
                        items: [
                          {
                            label: "Stake",
                            onClick: () => {
                                this.openTransferDialog("stake", t?.symbol, t?.balance)
                            }
                          },
                          {
                            label: "Delegate",
                            onClick: () => {
                                this.openTransferDialog(
                                    "delegate",
                                    t?.symbol,
                                    t?.balance - t?.delegationsOut
                                  )
                            }
                          }
                        ]
                      };
                    }
                    return (
                      <div className="amount-actions">
                        <DropDown {...dropDownConfig} float="right" />
                      </div>
                    );
                  })()}
                  <span>{t?.stakedBalance}</span>
                </div>

                
                 {t?.delegationsOut > 0 && <div className="amount amount-passive delegated-shares">
                      <span className="amount-btn" >
                         - {t.delegationsOut}
                      </span>
                  </div>} 
            
                     {t?.hasDelegations() &&
                      <div className="amount amount-passive received-shares">
                          <span className="amount-btn">
                           + {`${t?.delegationsIn} ${t?.symbol}`} 
                          </span>
                      </div>}                  
               
                  <div className="amount total-hive-power">
                     {t?.delegationsIn > 0 ? <span>
                      {t?.stakedBalance + t?.delegationsIn}
                      </span> : t.delegationsOut > 0 ?
                      <span>
                      {t?.stakedBalance - t?.delegationsOut}
                      </span>: null}
                  </div>
              </div>
                </div>
                </div>                   
                )
            })}                        
          </div>

        </div>
                <div className="dialog-placeholder">
                  <EngineTransactionList 
                  global={global} 
                  account={account} 
                  params={params} />
                </div>
                
        {this.state.transfer && (
          <Transfer
            {...this.props}
            activeUser={activeUser!}
            to={isMyPage ? undefined : account.name}
            mode={this.state.transferMode!}
            asset={this.state.transferAsset!}
            onHide={this.closeTransferDialog}
            assetBalance={this.state.assetBalance}
          />
        )}
     </div>
    );
  }
}

export default (p: Props) => {
    const props = {
      global: p.global,
      dynamicProps: p.dynamicProps,
      account: p.account,
      activeUser: p.activeUser,
      transactions: p.transactions,
      signingKey: p.signingKey,
      addAccount: p.addAccount,
      updateActiveUser: p.updateActiveUser,
      setSigningKey: p.setSigningKey,
      updateWalletValues: p.updateWalletValues,
      fetchPoints: p.fetchPoints
    };
  
    return <EngineTokenDetails {...props} />;
  };