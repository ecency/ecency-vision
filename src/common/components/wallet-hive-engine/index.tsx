import React from "react";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import WalletMenu from "../wallet-menu";

import formattedNumber from "../../util/formatted-number";

import { getHiveEngineTokenBalances } from "../../api/hive-engine";
import { HiveEngineTokenBalance } from "../../helper/hive-engine-wallet";
import { proxifyImageSrc } from "@ecency/render-helper";

import { _t } from "../../i18n";

import {_t} from "../../i18n";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  account: Account;
}

interface State {
  tokens: HiveEngineTokenBalance[];
  loading: boolean;
}

export class WalletHiveEngine extends BaseComponent<Props, State> {
  state: State = {
    tokens: [],
    loading: true,
  };

  componentDidMount() {
    this.fetch();
  }

  fetch = async () => {
    const { account } = this.props;

    this.stateSet({ loading: true });
    const items = await getHiveEngineTokenBalances(account.name);
    this.stateSet({ tokens: this.sort(items), loading: false });
  };

  sort = (items: HiveEngineTokenBalance[]) =>
    items.sort((a: HiveEngineTokenBalance, b: HiveEngineTokenBalance) => {
      if (a.balance !== b.balance) {
        return a.balance < b.balance ? 1 : -1;
      }

      if (a.stake !== b.stake) {
        return a.stake < b.stake ? 1 : -1;
      }

      return a.symbol > b.symbol ? 1 : -1;
    });

  render() {
    const { global, dynamicProps, account } = this.props;
    const { tokens, loading } = this.state;

    if (!account.__loaded) {
      return null;
    }

    const table = (
      <table className="table">
        <thead>
          <tr>
            <th>{_t("wallet-engine.token")}</th>
            <th>{_t("wallet-engine.balance")}</th>
            <th>{_t("wallet-engine.staked")}</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((b, i) => {
            const imageSrc = proxifyImageSrc(b.icon, 0, 0, global?.canUseWebp ? "webp" : "match");
            const fallbackImage = require("../../img/noimage.svg");

            return (
              <tr key={i}>
                <td>
                  <img
                    alt={b.symbol}
                    src={imageSrc}
                    className="item-image"
                    onError={(e: React.SyntheticEvent) => {
                      const target = e.target as HTMLImageElement;
                      target.src = fallbackImage;
                    }}
                  />
                  {b.name} ({b.symbol})
                </td>
                <td>
                  {b.balance < 0.0001
                    ? b.balance
                    : formattedNumber(b.balance, {
                        fractionDigits: b.precision
                      })}
                </td>
                <td>
                  {b.stakedBalance < 0.0001
                    ? b.stakedBalance
                    : formattedNumber(b.stakedBalance, {
                        fractionDigits: b.precision
                      })}
                  {b.hasDelegations() && " " + b.delegations()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );

    return (
      <div className="wallet-hive-engine">
        <div className="wallet-main">
          <div className="wallet-info">
            <div className="balance-row alternative">
              <div className="balance-info">
                <div className="title">{_t("wallet-engine.title")}</div>
                <div className="description">
                  {_t("wallet-engine.description")}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="dialog-placeholder">
                <LinearProgress />
              </div>
            ) : tokens.length === 0 ? (
              <div className="no-results">{_t("wallet-engine.no-results")}</div>
            ) : (
              <div className="table-responsive">{table}</div>
            )}
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
  };

  return <WalletHiveEngine {...props} />;
};
