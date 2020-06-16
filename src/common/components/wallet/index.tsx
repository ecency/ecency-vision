import React, { Component } from "react";

import { History } from "history";

import moment from "moment";

import { State as GlobalState } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { State as TransactionsState } from "../../store/transactions/types";

import Tooltip from "../tooltip";
import FormattedCurrency from "../formatted-currency";
import Transactions from "../transactions";
import DelegatedVesting from "../delegated-vesting";
import ReceivedVesting from "../received-vesting";

import parseAsset from "../../helper/parse-asset";
import { vestsToSp } from "../../helper/vesting";
import parseDate from "../../helper/parse-date";
import isEmptyDate from "../../helper/is-empty-date";

import formattedNumber from "../../util/formatted-number";

import { _t } from "../../i18n";

interface Props {
  history: History;
  global: GlobalState;
  dynamicProps: DynamicProps;
  transactions: TransactionsState;
  account: Account;
  addAccount: (data: Account) => void;
}

interface State {
  delegatedList: boolean;
  receivedList: boolean;
}

export default class Wallet extends Component<Props, State> {
  state: State = {
    delegatedList: false,
    receivedList: false,
  };

  toggleDelegatedList = () => {
    const { delegatedList } = this.state;
    this.setState({ delegatedList: !delegatedList });
  };

  toggleReceivedList = () => {
    const { receivedList } = this.state;
    this.setState({ receivedList: !receivedList });
  };

  render() {
    const { dynamicProps, account } = this.props;

    if (!account.__loaded) {
      return null;
    }

    const { hivePerMVests, base, quote } = dynamicProps;

    /* 
    Will need this
    const rewardHiveBalance = parseAsset(account.reward_steem_balance).amount;
    const rewardHbdBalance = parseAsset(account.reward_sbd_balance).amount;
    const rewardVestingHive = parseAsset(account.reward_vesting_steem).amount;
    
    const hasUnclaimedRewards = rewardHiveBalance > 0 || rewardHbdBalance > 0 || rewardVestingHive > 0;
    */

    const balance = parseAsset(account.balance).amount;

    const vestingShares = parseAsset(account.vesting_shares).amount;
    const vestingSharesDelegated = parseAsset(account.delegated_vesting_shares).amount;
    const vestingSharesReceived = parseAsset(account.received_vesting_shares).amount;

    const hbdBalance = parseAsset(account.sbd_balance).amount;
    const savingBalance = parseAsset(account.savings_balance).amount;
    const savingBalanceHbd = parseAsset(account.savings_sbd_balance).amount;

    const pricePerHive = base / quote;

    const totalHive = vestsToSp(vestingShares, hivePerMVests) + balance + savingBalance;

    const totalHbd = hbdBalance + savingBalanceHbd;

    const estimatedValue = totalHive * pricePerHive + totalHbd;
    const showPowerDown = !isEmptyDate(account.next_vesting_withdrawal);
    const nextVestingWithdrawal = parseDate(account.next_vesting_withdrawal!);

    // Math.min: 14th week powerdown: https://github.com/steemit/steem/issues/3237
    // "?:": to_withdraw & withdrawn is integer 0 not string with no powerdown
    const vestingSharesWithdrawal = showPowerDown
      ? Math.min(parseAsset(account.vesting_withdraw_rate).amount, (account.to_withdraw! - account.withdrawn!) / 100000)
      : 0;

    const vestingSharesTotal = vestingShares - vestingSharesDelegated + vestingSharesReceived - vestingSharesWithdrawal;

    return (
      <div className="wallet">
        <div className="balance-row estimated alternative">
          <div className="balance-info">
            <div className="title">{_t("wallet.estimated")}</div>
            <div className="description">{_t("wallet.estimated-description")}</div>
          </div>
          <div className="balance-values">
            <div className="amount estimated-value">
              <FormattedCurrency {...this.props} value={estimatedValue} fixAt={3} />
            </div>
          </div>
        </div>

        <div className="balance-row hive">
          <div className="balance-info">
            <div className="title">{_t("wallet.hive")}</div>
            <div className="description">{_t("wallet.hive-description")}</div>
          </div>
          <div className="balance-values">
            <div className="amount">{formattedNumber(balance, { suffix: "HIVE" })}</div>
          </div>
        </div>

        <div className="balance-row hive-power alternative">
          <div className="balance-info">
            <div className="title">{_t("wallet.hive-power")}</div>
            <div className="description">{_t("wallet.hive-power-description")}</div>
          </div>

          <div className="balance-values">
            <div className="amount">{formattedNumber(vestsToSp(vestingShares, hivePerMVests), { suffix: "HP" })}</div>

            {vestingSharesDelegated > 0 && (
              <div className="amount delegated-shares">
                <Tooltip content={_t("wallet.hive-power-delegated")}>
                  <span className="btn-delegated" onClick={this.toggleDelegatedList}>
                    {formattedNumber(vestsToSp(vestingSharesDelegated, hivePerMVests), { prefix: "-", suffix: "HP" })}
                  </span>
                </Tooltip>
              </div>
            )}

            {vestingSharesReceived > 0 && (
              <div className="amount received-shares">
                <Tooltip content={_t("wallet.hive-power-received")}>
                  <span className="btn-delegatee" onClick={this.toggleReceivedList}>
                    {formattedNumber(vestsToSp(vestingSharesReceived, hivePerMVests), { prefix: "+", suffix: "HP" })}
                  </span>
                </Tooltip>
              </div>
            )}

            {vestingSharesWithdrawal > 0 && (
              <div className="amount next-power-down-amount">
                <Tooltip content={_t("wallet.next-power-down-amount")}>
                  <span>
                    {formattedNumber(vestsToSp(vestingSharesWithdrawal, hivePerMVests), { prefix: "-", suffix: "HP" })}
                  </span>
                </Tooltip>
              </div>
            )}

            {(vestingSharesDelegated > 0 || vestingSharesReceived > 0 || vestingSharesWithdrawal > 0) && (
              <div className="amount total-hive-power">
                <Tooltip content={_t("wallet.hive-power-total")}>
                  <span>
                    {formattedNumber(vestsToSp(vestingSharesTotal, hivePerMVests), { prefix: "=", suffix: "HP" })}
                  </span>
                </Tooltip>
              </div>
            )}
          </div>
        </div>

        <div className="balance-row hive-dollars">
          <div className="balance-info">
            <div className="title">{_t("wallet.hive-dollars")}</div>
            <div className="description">{_t("wallet.hive-dollars-description")}</div>
          </div>
          <div className="balance-values">
            <div className="amount">{formattedNumber(hbdBalance, { prefix: "$" })}</div>
          </div>
        </div>

        <div className="balance-row savings alternative">
          <div className="balance-info">
            <div className="title">{_t("wallet.savings")}</div>
            <div className="description">{_t("wallet.savings-description")}</div>
          </div>
          <div className="balance-values">
            <div className="amount">{formattedNumber(savingBalance, { suffix: "HIVE" })}</div>
            <div className="amount">{formattedNumber(savingBalanceHbd, { suffix: "$" })}</div>
          </div>
        </div>

        {showPowerDown && (
          <div className="next-power-down">
            {_t("wallet.next-power-down", {
              time: moment(nextVestingWithdrawal).fromNow(),
              amount: formattedNumber(vestsToSp(vestingSharesWithdrawal, hivePerMVests), { prefix: "HIVE" }),
            })}
          </div>
        )}

        <Transactions {...this.props} />
        {this.state.delegatedList && (
          <DelegatedVesting {...this.props} account={account} onHide={this.toggleDelegatedList} />
        )}
        {this.state.receivedList && (
          <ReceivedVesting {...this.props} account={account} onHide={this.toggleReceivedList} />
        )}
      </div>
    );
  }
}
