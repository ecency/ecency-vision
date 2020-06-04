import React, { Component } from "react";

import numeral from "numeral";

import { State as GlobalState } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import Tooltip from "../tooltip";

import parseAsset from "../../helper/parse-asset";
import { vestsToSp } from "../../helper/vesting";

import parseDate from "../../helper/parse-date";
import isEmptyDate from "../../helper/is-empty-date";

import { _t } from "../../i18n";

interface Props {
  global: GlobalState;
  dynamicProps: DynamicProps;
  account: Account;
}

export default class ProfilePage extends Component<Props> {
  render() {
    const { global, dynamicProps, account } = this.props;

    if (!account.__loaded) {
      return null;
    }

    const { hivePerMVests, base, quote } = dynamicProps;
    const { currencySymbol } = global;

    const rewardHiveBalance = parseAsset(account.reward_steem_balance).amount;
    const rewardHbdBalance = parseAsset(account.reward_sbd_balance).amount;
    const rewardVestingHive = parseAsset(account.reward_vesting_steem).amount;

    const hasUnclaimedRewards = rewardHiveBalance > 0 || rewardHbdBalance > 0 || rewardVestingHive > 0;

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
    const showPowerDown = account.next_vesting_withdrawal !== "1969-12-31T23:59:59";
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
        <div className="first-row">
          {hasUnclaimedRewards && (
            <div className="unclaimed-rewards">
              <div className="title">{_t("wallet.unclaimed-rewards")}</div>
              <div className="rewards">
                {rewardHiveBalance > 0 && <span className="reward-type">{`${rewardHiveBalance} HIVE`}</span>}
                {rewardHbdBalance > 0 && <span className="reward-type">{`${rewardHbdBalance} HBD`}</span>}
                {rewardVestingHive > 0 && <span className="reward-type">{`${rewardVestingHive} HP`}</span>}
              </div>
            </div>
          )}

          <div className="estimated-value">
            <Tooltip content={_t("wallet.estimated-value")}>
              <span>
                {currencySymbol}
                {numeral(estimatedValue).format("0,0.000")}
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
}
