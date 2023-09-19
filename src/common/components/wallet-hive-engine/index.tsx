import React from "react";
import { proxifyImageSrc } from "@ecency/render-helper";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { Transactions } from "../../store/transactions/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import HiveEngineToken from "../../helper/hive-engine-wallet";
import LinearProgress from "../linear-progress";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import WalletMenu from "../wallet-menu";
import { SortEngineTokens } from "../sort-hive-engine-tokens";
import { EngineTokensEstimated } from "../engine-tokens-estimated";
import Transfer, { TransferMode } from "../transfer-he";
import { error, success } from "../feedback";
import "./_index.scss";

import {
  claimRewards,
  getHiveEngineTokenBalances,
  getMetrics,
  getUnclaimedRewards,
  TokenStatus
} from "../../api/hive-engine";

import {
  delegateOutlineSvg,
  informationVariantSvg,
  lockOutlineSvg,
  plusCircle,
  priceDownSvg,
  priceUpSvg,
  transferOutlineSvg,
  undelegateOutlineSvg,
  unlockOutlineSvg
} from "../../img/svg";

import { formatError } from "../../api/operations";
import formattedNumber from "../../util/formatted-number";
import { _t } from "../../i18n";
import { HiveEngineChart } from "../hive-engine-chart";

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

export class WalletHiveEngine extends BaseComponent<Props, State> {
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
    this._isMounted && this.priceChangePercent();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  sortTokensInAscending: any = () => {
    const inAscending = this.state.tokens.sort((a: any, b: any) => {
      if (a.symbol > b.symbol) return 1;
      if (a.symbol < b.symbol) return -1;
      return 0;
    });

    this.setState({ tokens: inAscending });
  };

  sortTokensInDescending: any = () => {
    const inDescending = this.state.tokens.sort((a: any, b: any) => {
      if (b.symbol < a.symbol) return -1;
      if (b.symbol > a.symbol) return 1;
      return 0;
    });

    this.setState({ tokens: inDescending });
  };

  sortTokensbyValue = async () => {
    const allUserTokens = await this.tokenUsdValue();
    const tokensInWallet = allUserTokens.filter(
      (a: any) => a.balance !== 0 || a.stakedBalance !== 0
    );
    const byValue = tokensInWallet.sort((a: any, b: any) => {
      if (b.usd_value < a.usd_value) return -1;
      if (b.usd_value > a.usd_value) return 1;
      return 0;
    });
    this.setState({ tokens: byValue });
  };

  sortTokensbyBalance = () => {
    const byBalance = this.state.tokens.sort((a: any, b: any) => {
      if (b.balance < a.balance) return -1;
      if (b.balance > a.balance) return 1;
      return 0;
    });

    this.setState({ tokens: byBalance });
  };

  sortTokensbyStake = () => {
    const byStake = this.state.tokens.sort((a: any, b: any) => {
      if (b.stake < a.stake) return -1;
      if (b.stake > a.stake) return 1;
      return 0;
    });

    this.setState({ tokens: byStake });
  };

  sortByDelegationIn = () => {
    const byDelegationsIn = this.state.tokens.sort((a: any, b: any) => {
      if (b.delegationsIn < a.delegationsIn) return -1;
      if (b.delegationsIn > a.delegationsIn) return 1;
      return 0;
    });

    this.setState({ tokens: byDelegationsIn });
  };

  sortByDelegationOut = () => {
    const byDelegationsOut = this.state.tokens.sort((a: any, b: any) => {
      if (b.delegationsOut < a.delegationsOut) return -1;
      if (b.delegationsOut > a.delegationsOut) return 1;
      return 0;
    });

    this.setState({ tokens: byDelegationsOut });
  };

  tokenUsdValue = async () => {
    const { account, dynamicProps } = this.props;
    const { allTokens } = this.state;
    const userTokens: any = await getHiveEngineTokenBalances(account.name);
    const pricePerHive = dynamicProps.base / dynamicProps.quote;

    let balanceMetrics: any = userTokens.map((item: any) => {
      let eachMetric = allTokens.find((m: any) => m.symbol === item.symbol);
      return {
        ...item,
        ...eachMetric
      };
    });
    let tokensUsdValues: any = balanceMetrics.map((w: any) => {
      const usd_value =
        w.symbol === "SWAP.HIVE"
          ? Number(pricePerHive * w.balance)
          : w.lastPrice === 0
          ? 0
          : Number(w.lastPrice * pricePerHive * w.balance).toFixed(10);
      return {
        ...w,
        usd_value
      };
    });
    return tokensUsdValues;
  };

  priceChangePercent = async () => {
    const allMarketTokens = await getMetrics();
    this.setState({ allTokens: allMarketTokens });
  };

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
    const { global, dynamicProps, account, activeUser } = this.props;
    const { rewards, tokens, loading, claiming, claimed, utokens, allTokens } = this.state;
    const hasUnclaimedRewards = rewards.length > 0;
    const hasMultipleUnclaimedRewards = rewards.length > 1;
    const isMyPage = activeUser && activeUser.username === account.name;
    let rewardsToShowInTooltip = [...rewards];
    rewardsToShowInTooltip = rewardsToShowInTooltip.splice(0, 10);

    if (!account.__loaded) {
      return null;
    }

    return (
      <div className="wallet-hive-engine">
        <div className="wallet-main">
          <div className="wallet-info">
            {hasUnclaimedRewards && (
              <div className="unclaimed-rewards">
                <div className="title">{_t("wallet.unclaimed-rewards")}</div>

                {hasMultipleUnclaimedRewards ? (
                  <div className="rewards">
                    <span className="reward-type">
                      <OverlayTrigger
                        delay={{ show: 0, hide: 500 }}
                        key={"bottom"}
                        placement={"bottom"}
                        overlay={
                          <Tooltip id={`tooltip-token`}>
                            <div className="tooltip-inner rewards-container">
                              {rewardsToShowInTooltip.map((reward, ind) => (
                                <div
                                  className="flex py-1 border-b border-[--border-color]"
                                  key={reward.pending_token + ind}
                                >
                                  <div className="mr-1 text-lowercase">{reward.symbol}: </div>
                                  <div>{reward.pending_token / Math.pow(10, reward.precision)}</div>
                                </div>
                              ))}
                            </div>
                          </Tooltip>
                        }
                      >
                        <div className="flex items-center">{`${rewards.length} tokens`}</div>
                      </OverlayTrigger>
                    </span>
                    {isMyPage && (
                      <a
                        className={`claim-btn ${claiming ? "in-progress" : ""}`}
                        onClick={() => this.claimRewards(rewards)}
                      >
                        {plusCircle}
                      </a>
                    )}
                  </div>
                ) : (
                  rewards.map((r, i) => {
                    const reward = r.pending_token / Math.pow(10, r.precision);

                    return (
                      <div className="rewards" key={i}>
                        <span className="reward-type">
                          {reward < 0.0001
                            ? `${reward} ${r.symbol}`
                            : formattedNumber(reward, {
                                fractionDigits: r.precision,
                                suffix: r.symbol
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
                    );
                  })
                )}
              </div>
            )}

            <div className="balance-row alternative">
              <div className="balance-info">
                <div className="title">{_t("wallet-engine.title")}</div>
                <div className="description">{_t("wallet-engine.description")}</div>
              </div>
            </div>

            <EngineTokensEstimated tokens={utokens} dynamicProps={dynamicProps} />

            {tokens.length >= 3 && (
              <div className="wallet-info">
                <SortEngineTokens
                  sortTokensInAscending={this.sortTokensInAscending}
                  sortTokensInDescending={this.sortTokensInDescending}
                  sortTokensbyValue={this.sortTokensbyValue}
                  sortTokensbyStake={this.sortTokensbyStake}
                  sortTokensbyBalance={this.sortTokensbyBalance}
                  sortByDelegationIn={this.sortByDelegationIn}
                  sortByDelegationOut={this.sortByDelegationOut}
                />
              </div>
            )}

            <div className="entry-list">
              {loading ? (
                <div className="dialog-placeholder">
                  <LinearProgress />
                </div>
              ) : tokens.length === 0 ? (
                <div className="no-results">{_t("wallet-engine.no-results")}</div>
              ) : (
                <div className="entry-list-body">
                  {tokens.map((b, i) => {
                    const imageSrc = proxifyImageSrc(
                      b.icon,
                      0,
                      0,
                      global?.canUseWebp ? "webp" : "match"
                    );
                    const fallbackImage = require("../../img/noimage.svg");

                    return (
                      <div className="entry-list-item" key={i}>
                        <div className="entry-header">
                          <img
                            alt={b.symbol}
                            src={imageSrc}
                            className="item-image"
                            onError={(e: React.SyntheticEvent) => {
                              const target = e.target as HTMLImageElement;
                              target.src = fallbackImage;
                            }}
                          />
                          {b.symbol}
                        </div>

                        {!global?.isMobile && (
                          <div className="flex">
                            <HiveEngineChart items={b} />
                          </div>
                        )}

                        <div className="ml-auto flex flex-col justify-between">
                          <div className="flex mb-1 align-self-end">
                            <div className="entry-body mr-md-2">
                              <span className="item-balance">{b.balanced()}</span>
                            </div>

                            <div className="ml-1">
                              <OverlayTrigger
                                delay={{ show: 0, hide: 300 }}
                                key={"bottom"}
                                placement={"bottom"}
                                overlay={
                                  <Tooltip id={`tooltip-${b.symbol}`}>
                                    <div className="tooltip-inner">
                                      <div className="profile-info-tooltip-content">
                                        <p>
                                          {_t("wallet-engine.token")}: {b.name}
                                        </p>
                                        <p>
                                          {_t("wallet-engine.balance")}: {b.balanced()}
                                        </p>
                                        <p>
                                          {_t("wallet-engine.staked")}: {b.staked()}
                                        </p>
                                        {b.delegationEnabled && (
                                          <>
                                            <p>In: {b.delegationsIn}</p>
                                            <p>Out: {b.delegationsOut}</p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </Tooltip>
                                }
                              >
                                <div className="flex items-center">
                                  <span className="info-icon mr-0 mr-md-2">
                                    {informationVariantSvg}
                                  </span>
                                </div>
                              </OverlayTrigger>
                            </div>
                          </div>

                          <div className="mr-3">
                            {allTokens?.map((x: any, i: any) => {
                              const changeValue = parseFloat(x?.priceChangePercent);
                              return (
                                <span
                                  key={i}
                                  className={`flex justify-content-end ${
                                    changeValue < 0 ? "text-red" : "text-green"
                                  }`}
                                >
                                  {x?.symbol === b.symbol && (
                                    <span className="mr-1">
                                      {changeValue < 0 ? priceDownSvg : priceUpSvg}
                                    </span>
                                  )}
                                  {x?.symbol === b.symbol ? x?.priceChangePercent : null}
                                </span>
                              );
                            })}
                          </div>

                          {isMyPage && (
                            <div className="flex justify-between ml-auto">
                              <div className="mr-1">
                                <OverlayTrigger
                                  delay={{ show: 0, hide: 500 }}
                                  key={"bottom"}
                                  placement={"bottom"}
                                  overlay={
                                    <Tooltip id={`tooltip-${b.symbol}`}>
                                      <div className="tooltip-inner">
                                        <div className="profile-info-tooltip-content">
                                          <p>Transfer</p>
                                        </div>
                                      </div>
                                    </Tooltip>
                                  }
                                >
                                  <div className="flex items-center flex-justify-center">
                                    <span
                                      onClick={() =>
                                        this.openTransferDialog("transfer", b.symbol, b.balance)
                                      }
                                      className="he-icon mr-0 mr-md-2"
                                    >
                                      {transferOutlineSvg}
                                    </span>
                                  </div>
                                </OverlayTrigger>
                              </div>

                              {b.delegationEnabled && b.delegationsOut !== b.balance && (
                                <div className="mr-1">
                                  <OverlayTrigger
                                    delay={{ show: 0, hide: 500 }}
                                    key={"bottom"}
                                    placement={"bottom"}
                                    overlay={
                                      <Tooltip id={`tooltip-${b.symbol}`}>
                                        <div className="tooltip-inner">
                                          <div className="profile-info-tooltip-content">
                                            <p>Delegate</p>
                                          </div>
                                        </div>
                                      </Tooltip>
                                    }
                                  >
                                    <div className="flex items-center flex-justify-center">
                                      <span
                                        onClick={() =>
                                          this.openTransferDialog(
                                            "delegate",
                                            b.symbol,
                                            b.balance - b.delegationsOut
                                          )
                                        }
                                        className="he-icon mr-0 mr-md-2"
                                      >
                                        {delegateOutlineSvg}
                                      </span>
                                    </div>
                                  </OverlayTrigger>
                                </div>
                              )}
                              {b.delegationEnabled && b.delegationsOut > 0 && (
                                <div className="mr-1">
                                  <OverlayTrigger
                                    delay={{ show: 0, hide: 500 }}
                                    key={"bottom"}
                                    placement={"bottom"}
                                    overlay={
                                      <Tooltip id={`tooltip-${b.symbol}`}>
                                        <div className="tooltip-inner">
                                          <div className="profile-info-tooltip-content">
                                            <p>Undelegate</p>
                                          </div>
                                        </div>
                                      </Tooltip>
                                    }
                                  >
                                    <div className="flex items-center flex-justify-center">
                                      <span
                                        onClick={() =>
                                          this.openTransferDialog(
                                            "undelegate",
                                            b.symbol,
                                            b.delegationsOut
                                          )
                                        }
                                        className="he-icon mr-0 mr-md-2"
                                      >
                                        {undelegateOutlineSvg}
                                      </span>
                                    </div>
                                  </OverlayTrigger>
                                </div>
                              )}

                              {b.stakingEnabled && (
                                <div className="mr-1">
                                  <OverlayTrigger
                                    delay={{ show: 0, hide: 500 }}
                                    key={"bottom"}
                                    placement={"bottom"}
                                    overlay={
                                      <Tooltip id={`tooltip-${b.symbol}`}>
                                        <div className="tooltip-inner">
                                          <div className="profile-info-tooltip-content">
                                            <p>Stake</p>
                                          </div>
                                        </div>
                                      </Tooltip>
                                    }
                                  >
                                    <div className="flex items-center flex-justify-center align-center">
                                      <span
                                        onClick={() =>
                                          this.openTransferDialog("stake", b.symbol, b.balance)
                                        }
                                        className="he-icon mr-0 mr-md-2"
                                      >
                                        {lockOutlineSvg}
                                      </span>
                                    </div>
                                  </OverlayTrigger>
                                </div>
                              )}
                              {b.stake > 0 && (
                                <div className="mr-1">
                                  <OverlayTrigger
                                    delay={{ show: 0, hide: 500 }}
                                    key={"bottom"}
                                    placement={"bottom"}
                                    overlay={
                                      <Tooltip id={`tooltip-${b.symbol}`}>
                                        <div className="tooltip-inner">
                                          <div className="profile-info-tooltip-content">
                                            <p>Unstake</p>
                                          </div>
                                        </div>
                                      </Tooltip>
                                    }
                                  >
                                    <div className="flex items-center flex-justify-center align-center">
                                      <span
                                        onClick={() =>
                                          this.openTransferDialog(
                                            "unstake",
                                            b.symbol,
                                            b.stakedBalance
                                          )
                                        }
                                        className="he-icon mr-0 mr-md-2"
                                      >
                                        {unlockOutlineSvg}
                                      </span>
                                    </div>
                                  </OverlayTrigger>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <WalletMenu global={global} username={account.name} active="engine" />
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
    updateWalletValues: p.updateWalletValues
  };

  return <WalletHiveEngine {...props} />;
};
