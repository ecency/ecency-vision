import { Account } from "../store/accounts/types";
import { DynamicProps } from "../store/dynamic-props/types";

import parseAsset from "./parse-asset";
import { vestsToHp } from "./vesting";
import isEmptyDate from "./is-empty-date";
import parseDate from "./parse-date";

export default class HiveWallet {
  public balance: number = 0;
  public savingBalance: number = 0;

  public hbdBalance: number = 0;
  public savingBalanceHbd: number = 0;

  public rewardHiveBalance: number = 0;
  public rewardHbdBalance: number = 0;
  public rewardVestingHive: number = 0;
  public hasUnclaimedRewards: boolean = false;

  public isPoweringDown: boolean = false;
  public nextVestingWithdrawalDate: Date = new Date();
  public nextVestingSharesWithdrawal: number = 0;
  public nextVestingSharesWithdrawalHive: number = 0;

  public vestingShares: number = 0;
  public vestingSharesDelegated: number = 0;
  public vestingSharesReceived: number = 0;
  public vestingSharesTotal: number = 0;
  public vestingSharesAvailable: number = 0;

  public totalHive: number = 0;
  public totalHbd: number = 0;

  public estimatedValue: number = 0;
  public toWithdraw: number = 0;
  public withdrawn: number = 0;
  public weeksLeft: number = 0;
  public savingHbdSeconds: number = 0;

  constructor(account: Account, dynamicProps: DynamicProps, convertingHBD: number = 0) {
    const { hivePerMVests, base, quote } = dynamicProps;
    const pricePerHive = base / quote;

    if (!account.__loaded) {
      return;
    }

    this.balance = parseAsset(account.balance).amount;
    this.savingBalance = parseAsset(account.savings_balance).amount;

    this.hbdBalance = parseAsset(account.hbd_balance).amount;
    this.savingBalanceHbd = parseAsset(account.savings_hbd_balance).amount;
    this.savingHbdSeconds = Number(account.savings_hbd_seconds);
    this.rewardHiveBalance = parseAsset(account.reward_hive_balance).amount;
    this.rewardHbdBalance = parseAsset(account.reward_hbd_balance).amount;
    this.rewardVestingHive = parseAsset(account.reward_vesting_hive).amount;
    this.hasUnclaimedRewards =
      this.rewardHiveBalance > 0 || this.rewardHbdBalance > 0 || this.rewardVestingHive > 0;

    this.isPoweringDown = !isEmptyDate(account.next_vesting_withdrawal);

    this.nextVestingWithdrawalDate = parseDate(account.next_vesting_withdrawal);

    this.nextVestingSharesWithdrawal = this.isPoweringDown
      ? Math.min(
          parseAsset(account.vesting_withdraw_rate).amount,
          (Number(account.to_withdraw) - Number(account.withdrawn)) / 1e6
        )
      : 0;
    this.nextVestingSharesWithdrawalHive = this.isPoweringDown
      ? vestsToHp(this.nextVestingSharesWithdrawal, hivePerMVests)
      : 0;

    this.vestingShares = parseAsset(account.vesting_shares).amount;
    this.vestingSharesDelegated = parseAsset(account.delegated_vesting_shares).amount;
    this.vestingSharesReceived = parseAsset(account.received_vesting_shares).amount;
    this.vestingSharesTotal =
      this.vestingShares -
      this.vestingSharesDelegated +
      this.vestingSharesReceived -
      this.nextVestingSharesWithdrawal;
    this.vestingSharesAvailable = this.isPoweringDown
      ? this.vestingShares -
        (Number(account.to_withdraw) - Number(account.withdrawn)) / 1e6 -
        this.vestingSharesDelegated
      : this.vestingShares - this.vestingSharesDelegated;

    this.totalHive =
      vestsToHp(this.vestingShares, hivePerMVests) + this.balance + this.savingBalance;
    this.totalHbd = this.hbdBalance + this.savingBalanceHbd + convertingHBD;

    this.estimatedValue = this.totalHive * pricePerHive + this.totalHbd;

    this.toWithdraw = this.isPoweringDown
      ? vestsToHp(Number(account.to_withdraw) / 1e6, hivePerMVests)
      : 0;
    this.withdrawn = this.isPoweringDown
      ? vestsToHp(Number(account.withdrawn), hivePerMVests / 1e6)
      : 0;
    this.weeksLeft = Math.round(
      (Number(this.toWithdraw) - Number(this.withdrawn)) / this.nextVestingSharesWithdrawalHive
    );
  }
}
