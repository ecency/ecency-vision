import React from "react";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import HiveEngineToken, {
  HiveEngineTokenEntryDelta,
  isUndefined
} from "../../helper/hive-engine-wallet";
import LinearProgress from "../linear-progress";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import WalletMenu from "../wallet-menu";
import {
  claimRewards,
  getHiveEngineTokenBalances,
  getUnclaimedRewards,
  getTokenDelegations,
  TokenStatus,
  DelegationEntry,
  Unstake,
  getPendingUnstakes,
  getFineTransactions,
  getCoarseTransactions
} from "../../api/hive-engine";
import { proxifyImageSrc } from "@ecency/render-helper";
import {
  informationVariantSvg,
  plusCircle,
  transferOutlineSvg,
  lockOutlineSvg,
  unlockOutlineSvg,
  delegateOutlineSvg,
  undelegateOutlineSvg,
  hiveEngineSvg
} from "../../img/svg";
import { error, success } from "../feedback";
import { formatError } from "../../api/operations";
import formattedNumber from "../../util/formatted-number";
import DropDown from "../dropdown";
import DelegatedVesting from "../delegated-vesting-hive-engine";
import ReceivedVesting from "../received-vesting";
import {
  HEFineTransactionToHiveTransactions,
  HEToHTransaction
} from "../../store/transactions/convert";
import TransactionList from "../transactions";
import { _t } from "../../i18n";
import FormattedCurrency from "../formatted-currency";
import { History, Location } from "history";
import { TransferMode } from "../transfer-he";
import { Modal } from "react-bootstrap";
import {
  OperationGroup,
  Transactions,
  Transaction,
  HEFineTransaction,
  HECoarseTransaction
} from "../../store/transactions/types";
interface TokenProps {
  symbol: string;
  name: "Payment Token";
  icon: string;
  precision: number;
  stakingEnabled: true;
  delegationEnabled: boolean;
  balance: number;
  stake: number;
  delegationsIn: number;
  delegationsOut: number;
  stakedBalance: number;
}

type TransferAsset = string;

interface Props {
  history: History;
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
  clearToken: () => void;
  openTransferDialog: (a: TransferMode, b: string, c: number) => void;
  closeTransferDialog: () => void;
  modifyTokenValues: (delta: HiveEngineTokenEntryDelta) => void;
  tokenName: string;
  hiveEngineToken: HiveEngineToken;
  delegationList: Array<DelegationEntry>;
}

interface State {
  loading: boolean;
  nextPowerDown: number;
  delegatedList: boolean;
  receivedList: boolean;
  transactions: Transactions;
  converting: number;
}

export class WalletHiveEngine extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    nextPowerDown: 0,
    delegatedList: false,
    receivedList: false,
    transactions: { list: [], loading: false, group: "", newest: null, oldest: null, debug: "" },
    converting: 0
  };
  componentDidMount() {
    const { tokenName, account } = this.props;
    this.fetchTokenUnstakes();
    this.fetchConvertingAmount();
    this.fetchHETransactions(tokenName, account.name, "");
  }
  keepTransaction(group: OperationGroup | "", tx: Transaction): boolean {
    switch (group) {
      case "transfers":
        return [
          "transfers",
          "transfer_to_vesting",
          "transfer_to_saving",
          "withdraw_vesting",
          "proposal-pay",
          "cancel_transfer_from_savings",
          "producer_reward",
          "claim_reward_balance"
        ].includes(tx.type);
      case "interests":
        return tx.type === "interest";
      case "rewards":
        return tx.type.endsWith("_reward") || tx.type == "tokens_issue";
      case "market-orders":
        return tx.type.startsWith("market_") || tx.type === "fill_order";
      case "stake-operations":
        return (
          "transfer_to_saving,withdraw_vesting,tokens_unstakeDone,tokens_stake,withdraw_vesting," +
          "return_vesting_delegation,tokens_unstakeStart,tokens_CancelUnstake," +
          "tokens_unstake,tokens_undelegateDone,tokens_delegate," +
          "tokens_undelegateStart"
        )
          .split(/,/)
          .includes(tx.type);
    }
    return true;
  }
  compareTransactions(a: Transaction, b: Transaction) {
    return a.timestamp > b.timestamp ? -1 : 1;
  }
  handleFineTransactions(fts: Array<HEFineTransaction>) {
    const { transactions } = this.state;
    const { list } = transactions;
    const ntxs = [...HEFineTransactionToHiveTransactions(fts), ...list]
      .filter(this.keepTransaction.bind(this, transactions.group))
      .sort(this.compareTransactions);
    this.stateSet({
      transactions: {
        list: ntxs,
        loading: false,
        group: transactions.group,
        newest: null,
        oldest: null,
        debug: `Range of data requested not recorded`
      }
    });
  }
  handleCoarseTransactions(group: OperationGroup | "", cts: Array<HECoarseTransaction>) {
    const { transactions } = this.state;
    try {
      const txs: Array<Transaction> = cts
        .map((t) => HEToHTransaction(t))
        .filter((x) => x != null)
        // @ts-ignore
        .filter(this.keepTransaction.bind(this, transactions.group));
      const { list } = transactions;
      this.stateSet({
        transactions: {
          list: txs,
          loading: false,
          group: transactions.group,
          newest: null,
          oldest: null,
          debug: `Range of data requested not recorded`
        }
      });
    } catch (e) {
      error("Unknown transaction type error.");
      console.log(e);
      this.stateSet({
        transactions: {
          list: transactions.list,
          loading: false,
          group: transactions.group,
          newest: null,
          oldest: null,
          debug: `Exception thrown: ` + e.message
        }
      });
    }
  }
  fetchHETransactions = (
    symbol: string,
    name: string,
    group?: OperationGroup | "",
    start?: number = 0,
    limit?: number = 200
  ) => {
    const { transactions } = this.state;
    const { list } = transactions;
    this.stateSet({
      transactions: {
        list: [],
        loading: true,
        group: group || "",
        newest: null,
        oldest: null,
        debug: `Range of data requested not recorded`
      }
    });
    if (group === "rewards")
      getFineTransactions(symbol, name, group === "rewards" ? limit : limit, start)
        .then(this.handleFineTransactions.bind(this))
        .catch((e) => {
          console.log(e);
        });
    else
      getCoarseTransactions(name, limit, symbol, start)
        .then(this.handleCoarseTransactions.bind(this, group ? group : ""))
        .catch(console.log);
  };
  fetchConvertingAmount = () => {
    //    const {account} = this.props;
    //    getConversionRequests(account.name).then(r => {
    //      if (r.length === 0) {
    //        return;
    //      }
    //      let converting = 0;
    //      r.forEach(x => {
    //        converting += parseAsset(x.amount).amount;
    //      });
    //      this.stateSet({converting});
    //    });
  };
  toggleDelegatedList = () => {
    const { delegatedList } = this.state;
    this.stateSet({ delegatedList: !delegatedList });
  };
  toggleReceivedList = () => {
    const { receivedList } = this.state;
    this.stateSet({ receivedList: !receivedList });
  };
  fetchTokenUnstakes = async () => {
    const { account, tokenName, hiveEngineToken } = this.props;
    return getPendingUnstakes(account.name, tokenName).then((items) => {
      items = items.filter((item) => {
        const { quantityLeft } = item;
        return quantityLeft != "0";
      });
      let nextPowerDown = 0;
      if (hiveEngineToken && items.length > 0) {
        const { precision } = hiveEngineToken;
        const { numberTransactionsLeft, quantityLeft } = items[0];
        const quotient: number =
          parseFloat(numberTransactionsLeft as string) / parseFloat(quantityLeft as string);
        if (!isNaN(quotient)) {
          nextPowerDown = quotient;
        }
      }
      this.setState({ nextPowerDown, loading: false });
    });
  };

  render() {
    const {
      global,
      dynamicProps,
      account,
      activeUser,
      tokenName,
      openTransferDialog,
      closeTransferDialog,
      delegationList,
      hiveEngineToken,
      history
    } = this.props;
    const { loading, nextPowerDown, delegatedList, receivedList, transactions } = this.state;
    const isMyPage = activeUser && activeUser.username === account.name;

    if (!account.__loaded) {
      return null;
    }

    if (isUndefined(hiveEngineToken)) {
      return null;
    }

    const estimatedValue: number | false = false;
    const { precision, icon, stakingEnabled, delegationEnabled } =
      hiveEngineToken as HiveEngineToken;
    // ts-ignore
    const [balance, stake, stakedBalance, delegationsIn, delegationsOut] = [
      hiveEngineToken.balance,
      hiveEngineToken.stake,
      hiveEngineToken.stakedBalance,
      hiveEngineToken.delegationsIn,
      hiveEngineToken.delegationsOut
    ];

    const fetchHETransactions = () => {
      return [];
    };

    return loading ? (
      <LinearProgress />
    ) : (
      <div className="wallet-hive-engine">
        <div className="wallet-main">
          <div className="wallet-info">
            <div className="balance-row">
              <div className="balance-info">
                <div className="title">{tokenName}</div>
                <div className="description">
                  {_t("wallet.token-description", { hiveEngineToken })}
                </div>
              </div>
              <div className="balance-values">
                <div className="amount">
                  {(() => {
                    if (isMyPage) {
                      const dropDownConfig = {
                        history: null,
                        label: "",
                        items: [
                          {
                            label: _t("wallet.transfer"),
                            onClick: () => {
                              openTransferDialog("transfer", tokenName, balance);
                            }
                          },
                          ...(stakingEnabled
                            ? [
                                {
                                  label: _t("wallet.power-up"),
                                  onClick: () => {
                                    openTransferDialog("stake", tokenName, balance);
                                  }
                                }
                              ]
                            : []),
                          {
                            label: "Trade at LeoDex",
                            onClick: () => {
                              window.open(`https://leodex.io/market/${tokenName}`, "leodex");
                            }
                          },
                          {
                            label: "Trade at TribalDex",
                            onClick: () => {
                              window.open("https://tribaldex.com/trade/" + tokenName, "tribaldex");
                            }
                          },
                          {
                            label: `Trade at HiveEngine`,
                            onClick: () => {
                              window.open(
                                `https://hive-engine.com/?p=market&t=${tokenName}`,
                                "hiveEngineDex"
                              );
                            }
                          }
                        ]
                      };
                      return (
                        <div className="amount-actions">
                          <DropDown {...dropDownConfig} float="right" />
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <span>
                    {formattedNumber(balance, {
                      maximumFractionDigits: precision,
                      minimumFractionDigits: 0,
                      suffix: tokenName
                    })}
                  </span>
                </div>
              </div>
            </div>

            {(stake || stakedBalance || stakingEnabled) && (
              <div className="balance-row hive-power alternative">
                <div className="balance-info">
                  <div className="title">{_t("wallet.staked", hiveEngineToken)}</div>
                  <div className="description">
                    {_t("wallet.staked-description", hiveEngineToken)}
                  </div>
                </div>
                <div className="balance-values">
                  <div className="amount">
                    {(() => {
                      if (isMyPage) {
                        const dropDownConfig = {
                          history: null,
                          label: "",
                          items: [
                            {
                              label: _t("wallet.delegate"),
                              onClick: () => {
                                openTransferDialog("delegate", tokenName, stakedBalance);
                              }
                            },
                            {
                              label: _t("wallet.power-down"),
                              onClick: () => {
                                openTransferDialog("unstake", tokenName, stakedBalance);
                              }
                            }
                          ]
                        };
                        return (
                          <div className="amount-actions">
                            <DropDown {...dropDownConfig} float="right" />
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {formattedNumber(stake, {
                      suffix: tokenName,
                      fractionDigits: 0,
                      maximumFractionDigits: precision
                    })}
                  </div>
                  {delegationsOut > 0 && (
                    <div className="amount amount-passive delegated-shares">
                      <OverlayTrigger
                        delay={{ show: 0, hide: 500 }}
                        key={"bottom"}
                        placement={"bottom"}
                        overlay={
                          <Tooltip id="token-power-delegated">
                            {_t("wallet.token-power-delegated", hiveEngineToken)}
                          </Tooltip>
                        }
                      >
                        <span className="amount-btn" onClick={this.toggleDelegatedList}>
                          {formattedNumber(delegationsOut, {
                            prefix: "-",
                            suffix: tokenName,
                            fractionDigits: precision
                          })}
                        </span>
                      </OverlayTrigger>
                    </div>
                  )}
                  {delegationEnabled &&
                    (() => {
                      if (delegationsIn <= 0) {
                        return null;
                      }
                      const strReceived = formattedNumber(delegationsIn, {
                        prefix: "+",
                        suffix: tokenName,
                        fractionDigits: precision
                      });

                      return (
                        <div className="amount amount-passive received-shares">
                          <OverlayTrigger
                            delay={{ show: 0, hide: 500 }}
                            key={"bottom"}
                            placement={"bottom"}
                            overlay={
                              <Tooltip id="power-received">
                                <div>{_t("wallet.token-power-received", hiveEngineToken)}</div>
                              </Tooltip>
                            }
                          >
                            <span className="amount-btn">{strReceived}</span>
                          </OverlayTrigger>
                        </div>
                      );
                    })()}
                  {nextPowerDown !== 0 && (
                    <div className="amount amount-passive next-power-down-amount">
                      <div>{_t("wallet.next-power-down-amount")}</div>
                      <span>
                        {formattedNumber(nextPowerDown, {
                          prefix: "-",
                          suffix: tokenName,
                          fractionDigits: precision
                        })}
                      </span>
                    </div>
                  )}
                  {(delegationsOut > 0 || delegationsIn > 0) && (
                    <div className="amount total-hive-power">
                      <OverlayTrigger
                        delay={{ show: 0, hide: 500 }}
                        key={"bottom"}
                        placement={"bottom"}
                        overlay={
                          <Tooltip id="token-power-delegated">
                            {_t("wallet.hive-power-total")}
                          </Tooltip>
                        }
                      >
                        <span>
                          {formattedNumber(stakedBalance, {
                            prefix: "=",
                            suffix: tokenName,
                            fractionDigits: precision
                          })}
                        </span>
                      </OverlayTrigger>
                      <Tooltip id="delegations-out">
                        {_t("wallet.hive-power-total")}
                        <span>
                          {formattedNumber(stakedBalance, { prefix: "=", suffix: tokenName })}
                        </span>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            )}
            {TransactionList({
              global,
              dynamicProps,
              tokenName,
              fetchTransactions: this.fetchHETransactions.bind(this, tokenName),
              history: history,
              transactions: transactions,
              account: account
            })}
          </div>
        </div>
        {this.state.delegatedList && (
          <DelegatedVesting
            {...this.props}
            hiveEngineToken={hiveEngineToken}
            delegationList={delegationList}
            account={account}
            onHide={this.toggleDelegatedList}
          />
        )}
        {this.state.receivedList && (
          <ReceivedVesting {...this.props} account={account} onHide={this.toggleReceivedList} />
        )}
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
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
    fetchPoints: p.fetchPoints,
    tokenName: p.tokenName,
    clearToken: p.clearToken,
    openTransferDialog: p.openTransferDialog,
    closeTransferDialog: p.closeTransferDialog,
    modifyTokenValues: p.modifyTokenValues,
    hiveEngineToken: p.hiveEngineToken,
    delegationList: p.delegationList
  };

  return <WalletHiveEngine {...props} />;
};
