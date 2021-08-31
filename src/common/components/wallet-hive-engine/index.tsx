import React from "react";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import HiveEngineToken from "../../helper/hive-engine-wallet";
import LinearProgress from "../linear-progress";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import WalletMenu from "../wallet-menu";

import {
  claimReward,
  getHiveEngineTokenBalances,
  getUnclaimedRewards,
  TokenStatus,
} from "../../api/hive-engine";
import { proxifyImageSrc } from "@ecency/render-helper";
import { informationVariantSvg, plusCircle } from "../../img/svg";
import { error, success } from "../feedback";
import { formatError } from "../../api/operations";
import formattedNumber from "../../util/formatted-number";

import { _t } from "../../i18n";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  account: Account;
  activeUser: ActiveUser | null;
}

interface State {
  tokens: HiveEngineToken[];
  rewards: TokenStatus[];
  loading: boolean;
  claiming: boolean;
  claimed: boolean;
}

export class WalletHiveEngine extends BaseComponent<Props, State> {
  state: State = {
    tokens: [],
    rewards: [],
    loading: true,
    claiming: false,
    claimed: false,
  };

  componentDidMount() {
    this.fetch();
    this.fetchUnclaimedRewards();
  }

  fetch = async () => {
    const { account } = this.props;

    this.stateSet({ loading: true });
    const items = await getHiveEngineTokenBalances(account.name);
    this.stateSet({ tokens: this.sort(items), loading: false });
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

    const rewards = await getUnclaimedRewards(account.name);
    this.stateSet({ rewards });
  };

  claimReward = (symbol: string) => {
    const { activeUser } = this.props;
    const { claiming } = this.state;

    if (claiming || !activeUser) {
      return;
    }

    this.stateSet({ claiming: true });

    return claimReward(activeUser.username, symbol)
      .then((account) => {
        success(_t("wallet.claim-reward-balance-ok"));
      })
      .catch((err) => {
        error(formatError(err));
      })
      .finally(() => {
        this.setState({ claiming: false });
      });
  };

  render() {
    const { global, dynamicProps, account, activeUser } = this.props;
    const { rewards, tokens, loading, claiming, claimed } = this.state;
    const hasUnclaimedRewards = rewards.length > 0;
    const isMyPage = activeUser && activeUser.username === account.name;

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

                {rewards.map((r, i) => {
                  const reward = r.pending_token / Math.pow(10, r.precision);

                  return (
                    <div className="rewards" key={i}>
                      <span className="reward-type">
                        {reward < 0.0001
                          ? `${reward} ${r.symbol}`
                          : formattedNumber(reward, {
                              fractionDigits: r.precision,
                              suffix: r.symbol,
                            })}
                      </span>
                      {isMyPage && (
                        <a
                          className={`claim-btn ${
                            claiming ? "in-progress" : ""
                          }`}
                          onClick={() => this.claimReward(r.symbol)}
                        >
                          {plusCircle}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="balance-row alternative">
              <div className="balance-info">
                <div className="title">{_t("wallet-engine.title")}</div>
                <div className="description">
                  {_t("wallet-engine.description")}
                </div>
              </div>
            </div>

            <div className="entry-list">
              {loading ? (
                <div className="dialog-placeholder">
                  <LinearProgress />
                </div>
              ) : tokens.length === 0 ? (
                <div className="no-results">
                  {_t("wallet-engine.no-results")}
                </div>
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
                        <div className="entry-header d-flex align-items-center ">
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
                        <div className="entry-body ml-auto mr-auto d-flex align-items-center ">
                          {/* <span className="item-conversion">$9.19/</span> */}
                          <span className="item-balance">
                            {b.balanced()} {b.symbol}
                          </span>
                        </div>

                        <div className="d-flex align-items-center ml-auto ml-md-2">
                          <OverlayTrigger
                            delay={{ show: 0, hide: 500 }}
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
                                      {_t("wallet-engine.balance")}:{" "}
                                      {b.balanced()} {b.symbol}
                                    </p>
                                    <p>
                                      {_t("wallet-engine.staked")}: {b.staked()}
                                    </p>
                                    {b.hasDelegations() &&
                                      `<p>${b.delegations()}</p>`}
                                  </div>
                                </div>
                              </Tooltip>
                            }
                          >
                            <div className="d-flex align-items-center">
                              <span className="info-icon mr-0 mr-md-2">
                                {informationVariantSvg}
                              </span>
                            </div>
                          </OverlayTrigger>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <WalletMenu
            global={global}
            username={account.name}
            active="hive-engine"
          />
        </div>
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
  };

  return <WalletHiveEngine {...props} />;
};
