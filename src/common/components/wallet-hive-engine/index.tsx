import React from "react";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import WalletMenu from "../wallet-menu";

import { TokenBalance, getTokenBalances } from "../../api/hive-engine";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  account: Account;
}

interface State {
  tokens: TokenBalance[];
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
    const items = await getTokenBalances(account.name);
    this.stateSet({ tokens: this.sort(items), loading: false });
  };

  sort = (items: TokenBalance[]) =>
    items.sort((a: TokenBalance, b: TokenBalance) => {
      const balanceA = Number(a.balance);
      const balanceB = Number(b.balance);
      if (balanceA !== balanceB) {
        return balanceA < balanceB ? 1 : -1;
      }

      const stakeA = Number(a.stake);
      const stakeB = Number(b.stake);
      if (stakeA !== stakeB) {
        return stakeA < stakeB ? 1 : -1;
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
            <th>Token</th>
            <th>Balance</th>
            <th>Staked</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((row, i) => {
            return (
              <tr key={row.symbol}>
                <td>{row.symbol}</td>
                <td>{row.balance}</td>
                <td>{row.stake}</td>
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
                <div className="title">{"Hive Engine Tokens"}</div>
                <div className="description">
                  {
                    "Hive Engine is a smart contracts side-chain platform for the Hive blockchain."
                  }
                </div>
              </div>
            </div>

            {loading ? (
              <div className="dialog-placeholder">
                <LinearProgress />
              </div>
            ) : tokens.length === 0 ? (
              <div className="no-results">No tokens found</div>
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
