import React, { Component } from "react";

import moment from "moment";

import { State as GlobalState } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import Tooltip from "../tooltip";
import FormattedCurrency from "../formatted-currency";

import parseAsset from "../../helper/parse-asset";
import { vestsToSp } from "../../helper/vesting";
import parseDate from "../../helper/parse-date";
import isEmptyDate from "../../helper/is-empty-date";

import formattedNumber from "../../util/formatted-number";

import { _t } from "../../i18n";

interface Props {
  global: GlobalState;
  dynamicProps: DynamicProps;
  account: Account;
}

export default class ProfilePage extends Component<Props> {
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

    const sbdBalance = parseAsset(account.sbd_balance).amount;
    const savingBalance = parseAsset(account.savings_balance).amount;
    const savingBalanceSbd = parseAsset(account.savings_sbd_balance).amount;

    const pricePerHive = base / quote;

    const totalHive = vestsToSp(vestingShares, hivePerMVests) + balance + savingBalance;

    const totalSbd = sbdBalance + savingBalanceSbd;

    const estimatedValue = totalHive * pricePerHive + totalSbd;
    const showPowerDown = !isEmptyDate(account.next_vesting_withdrawal);
    const nextVestingWithdrawal = parseDate(account.next_vesting_withdrawal!);

    // Math.min: 14th week powerdown: https://github.com/steemit/steem/issues/3237
    // "?:": to_withdraw & withdrawn is integer 0 not string with no powerdown
    const vestingSharesWithdrawal = showPowerDown
      ? Math.min(
          parseAsset(account.vesting_withdraw_rate).amount,
          (parseAsset(account.to_withdraw).amount - parseAsset(account.withdrawn).amount) / 100000
        )
      : 0;

    const vestingSharesTotal = vestingShares - vestingSharesDelegated + vestingSharesReceived - vestingSharesWithdrawal;

    return (
      <div className="wallet">
        <div className="balance-row estimated alternative">
          <div className="balance-info">
            <div className="title">{_t("wallet.estimated")}</div>
            <div className="description" dangerouslySetInnerHTML={{ __html: _t("wallet.estimated-description") }} />
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
            <div className="description" dangerouslySetInnerHTML={{ __html: _t("wallet.hive-description") }} />
          </div>
          <div className="balance-values">
            <div className="amount">{formattedNumber(balance, { suffix: "HIVE" })}</div>
          </div>
        </div>

        <div className="balance-row hive-power alternative">
          <div className="balance-info">
            <div className="title">{_t("wallet.hive-power")}</div>
            <div className="description" dangerouslySetInnerHTML={{ __html: _t("wallet.hive-power-description") }} />
          </div>

          <div className="balance-values">
            <div className="amount">{formattedNumber(vestsToSp(vestingShares, hivePerMVests), { suffix: "HP" })}</div>

            {vestingSharesDelegated > 0 && (
              <div className="amount delegated-shares">
                <Tooltip content={_t("wallet.hive-power-delegated")} placement="left">
                  <span className="btn-delegated">
                    {formattedNumber(vestsToSp(vestingSharesDelegated, hivePerMVests), { prefix: "-", suffix: "HP" })}
                  </span>
                </Tooltip>
              </div>
            )}

            {vestingSharesReceived > 0 && (
              <div className="amount received-shares">
                <Tooltip content={_t("wallet.hive-power-received")} placement="left">
                  <span className="btn-delegatee" role="none">
                    {formattedNumber(vestsToSp(vestingSharesReceived, hivePerMVests), { prefix: "+", suffix: "HP" })}
                  </span>
                </Tooltip>
              </div>
            )}

            {vestingSharesWithdrawal > 0 && (
              <div className="amount next-power-down-amount">
                <Tooltip content={_t("wallet.next-power-down-amount")} placement="left">
                  <span>
                    {formattedNumber(vestsToSp(vestingSharesWithdrawal, hivePerMVests), { prefix: "-", suffix: "HP" })}
                  </span>
                </Tooltip>
              </div>
            )}

            {(vestingSharesDelegated > 0 || vestingSharesReceived > 0 || vestingSharesWithdrawal > 0) && (
              <div className="amount total-hive-power">
                <Tooltip content={_t("wallet.hive-power-total")} placement="left">
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
            <div className="description" dangerouslySetInnerHTML={{ __html: _t("wallet.hive-dollars-description") }} />
          </div>
          <div className="balance-values">
            <div className="amount">{formattedNumber(sbdBalance, { prefix: "$" })}</div>
          </div>
        </div>

        <div className="balance-row savings alternative">
          <div className="balance-info">
            <div className="title">{_t("wallet.savings")}</div>
            <div className="description" dangerouslySetInnerHTML={{ __html: _t("wallet.savings-description") }} />
          </div>
          <div className="balance-values">
            <div className="amount">{formattedNumber(savingBalance, { suffix: "HIVE" })}</div>
            <div className="amount">{formattedNumber(savingBalanceSbd, { suffix: "$" })}</div>
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
      </div>
    );
  }
}
