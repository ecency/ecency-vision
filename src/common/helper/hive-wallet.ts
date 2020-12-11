import {Account} from "../store/accounts/types";
import {DynamicProps} from "../store/dynamic-props/types";

import parseAsset from "./parse-asset";
import {vestsToHp} from "./vesting";
import isEmptyDate from "./is-empty-date";
import parseDate from "./parse-date";

export default class HiveWallet {
    public balance: number;
    public savingBalance: number;

    public hbdBalance: number;
    public savingBalanceHbd: number;

    public rewardHiveBalance: number;
    public rewardHbdBalance: number;
    public rewardVestingHive: number;
    public hasUnclaimedRewards: boolean;

    public isPoweringDown: boolean;
    public nextVestingWithdrawalDate: Date;
    public nextVestingSharesWithdrawal: number;

    public vestingShares: number;
    public vestingSharesDelegated: number;
    public vestingSharesReceived: number;
    public vestingSharesTotal: number;
    public vestingSharesForDelegation: number;

    public totalHive: number;
    public totalHbd: number;

    public estimatedValue: number;


    constructor(account: Account, dynamicProps: DynamicProps) {
        const {hivePerMVests, base, quote} = dynamicProps;
        const pricePerHive = base / quote;

        this.balance = parseAsset(account.balance).amount;
        this.savingBalance = parseAsset(account.savings_balance).amount;

        this.hbdBalance = parseAsset(account.sbd_balance || account.hbd_balance).amount;
        this.savingBalanceHbd = parseAsset(account.savings_sbd_balance || account.savings_hbd_balance).amount;

        this.rewardHiveBalance = parseAsset(account.reward_steem_balance || account.reward_hive_balance).amount;
        this.rewardHbdBalance = parseAsset(account.reward_sbd_balance || account.reward_hbd_balance).amount;
        this.rewardVestingHive = parseAsset(account.reward_vesting_steem || account.reward_vesting_hive).amount;
        this.hasUnclaimedRewards = this.rewardHiveBalance > 0 || this.rewardHbdBalance > 0 || this.rewardVestingHive > 0;

        this.isPoweringDown = !isEmptyDate(account.next_vesting_withdrawal);

        this.nextVestingWithdrawalDate = parseDate(account.next_vesting_withdrawal!);

        this.nextVestingSharesWithdrawal = this.isPoweringDown
            ? Math.min(
                parseAsset(account.vesting_withdraw_rate).amount,
                (account.to_withdraw! - account.withdrawn!) / 1e6
            ) : 0;

        this.vestingShares = parseAsset(account.vesting_shares).amount;
        this.vestingSharesDelegated = parseAsset(account.delegated_vesting_shares).amount;
        this.vestingSharesReceived = parseAsset(account.received_vesting_shares).amount;
        this.vestingSharesTotal = this.vestingShares - this.vestingSharesDelegated + this.vestingSharesReceived - this.nextVestingSharesWithdrawal;
        this.vestingSharesForDelegation = this.isPoweringDown ?
            this.vestingShares - (account.to_withdraw! - account.withdrawn!) / 1e6 - this.vestingSharesDelegated :
            this.vestingShares - this.vestingSharesDelegated;

        this.totalHive = vestsToHp(this.vestingShares, hivePerMVests) + this.balance + this.savingBalance;
        this.totalHbd = this.hbdBalance + this.savingBalanceHbd;

        this.estimatedValue = this.totalHive * pricePerHive + this.totalHbd;
    }
}
