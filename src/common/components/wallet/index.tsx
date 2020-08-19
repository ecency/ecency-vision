import React, {Component} from "react";

import {History} from "history";

import moment from "moment";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Transactions} from "../../store/transactions/types";
import {ActiveUser} from "../../store/active-user/types";

import Tooltip from "../tooltip";
import FormattedCurrency from "../formatted-currency";
import TransactionList from "../transactions";
import DelegatedVesting from "../delegated-vesting";
import ReceivedVesting from "../received-vesting";
import DropDown from "../dropdown";
import Transfer, {TransferMode, TransferAsset} from "../transfer";
import {error, success} from "../feedback";

import parseAsset from "../../helper/parse-asset";
import {vestsToSp} from "../../helper/vesting";
import parseDate from "../../helper/parse-date";
import isEmptyDate from "../../helper/is-empty-date";

import {getAccount} from "../../api/hive";
import {claimRewardBalance, formatError} from "../../api/operations";

import formattedNumber from "../../util/formatted-number";

import {_t} from "../../i18n";

import {plusCircle} from "../../img/svg";

interface Props {
    history: History;
    global: Global;
    dynamicProps: DynamicProps;

    activeUser: ActiveUser | null;
    transactions: Transactions;
    account: Account;
    addAccount: (data: Account) => void;
    updateActiveUser: (data?: Account) => void;
}

interface State {
    delegatedList: boolean;
    receivedList: boolean;
    claiming: boolean;
    claimed: boolean;
    transfer: boolean;
    transferMode: null | TransferMode;
    transferAsset: null | TransferAsset;
}

export class Wallet extends Component<Props, State> {
    state: State = {
        delegatedList: false,
        receivedList: false,
        claiming: false,
        claimed: false,
        transfer: false,
        transferMode: null,
        transferAsset: null
    };

    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (obj: {}, cb: () => void = () => {
    }) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    toggleDelegatedList = () => {
        const {delegatedList} = this.state;
        this.stateSet({delegatedList: !delegatedList});
    };

    toggleReceivedList = () => {
        const {receivedList} = this.state;
        this.stateSet({receivedList: !receivedList});
    };

    claimRewardBalance = () => {
        const {activeUser, updateActiveUser} = this.props;
        const {claiming} = this.state;

        if (claiming || !activeUser) {
            return;
        }

        this.stateSet({claiming: true});

        return getAccount(activeUser?.username!)
            .then(account => {
                const {
                    reward_steem_balance: hiveBalance = account.reward_hive_balance,
                    reward_sbd_balance: hbdBalance = account.reward_hbd_balance,
                    reward_vesting_balance: vestingBalance
                } = account;

                return claimRewardBalance(activeUser?.username!, hiveBalance!, hbdBalance!, vestingBalance!)
            }).then(() => getAccount(activeUser.username))
            .then(account => {
                success(_t('wallet.claim-reward-balance-ok'));
                this.stateSet({claiming: false, claimed: true});
                updateActiveUser(account);
            }).catch(err => {
                error(formatError(err));
                this.stateSet({claiming: false});
            })
    }

    openTransferDialog = (mode: TransferMode, asset: TransferAsset) => {
        this.stateSet({transfer: true, transferMode: mode, transferAsset: asset});
    }

    closeTransferDialog = () => {
        this.stateSet({transfer: false, transferMode: null, transferAsset: null});
    }

    render() {
        const {dynamicProps, account, activeUser} = this.props;
        const {claiming, claimed, transfer, transferAsset, transferMode} = this.state;

        if (!account.__loaded) {
            return null;
        }

        const {hivePerMVests, base, quote} = dynamicProps;
        const isMyPage = activeUser && activeUser.username === account.name;

        const rewardHiveBalance = parseAsset(account.reward_steem_balance || account.reward_hive_balance).amount;
        const rewardHbdBalance = parseAsset(account.reward_sbd_balance || account.reward_hbd_balance).amount;
        const rewardVestingHive = parseAsset(account.reward_vesting_steem || account.reward_vesting_hive).amount;
        const hasUnclaimedRewards = rewardHiveBalance > 0 || rewardHbdBalance > 0 || rewardVestingHive > 0;

        const balance = parseAsset(account.balance).amount;

        const vestingShares = parseAsset(account.vesting_shares).amount;
        const vestingSharesDelegated = parseAsset(account.delegated_vesting_shares).amount;
        const vestingSharesReceived = parseAsset(account.received_vesting_shares).amount;

        const hbdBalance = parseAsset(account.sbd_balance || account.hbd_balance).amount;
        const savingBalance = parseAsset(account.savings_balance).amount;
        const savingBalanceHbd = parseAsset(account.savings_sbd_balance || account.savings_hbd_balance).amount;

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

                {transfer && <Transfer {...this.props} activeUser={activeUser!} mode={transferMode!} asset={transferAsset!} onHide={this.closeTransferDialog}/>}

                {(hasUnclaimedRewards && !claimed) && (
                    <div className="unclaimed-rewards">
                        <div className="title">
                            {_t('wallet.unclaimed-rewards')}
                        </div>
                        <div className="rewards">
                            {rewardHiveBalance > 0 && (
                                <span className="reward-type">{`${rewardHiveBalance} HIVE`}</span>
                            )}
                            {rewardHbdBalance > 0 && (
                                <span className="reward-type">{`${rewardHbdBalance} HBD`}</span>
                            )}
                            {rewardVestingHive > 0 && (
                                <span className="reward-type">{`${rewardVestingHive} HP`}</span>
                            )}
                            {isMyPage && (
                                <Tooltip content={_t('wallet.claim-reward-balance')}>
                                    <a
                                        className={`claim-btn ${claiming ? 'in-progress' : ''}`}
                                        onClick={this.claimRewardBalance}
                                    >
                                        {plusCircle}
                                    </a>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                )}

                <div className="balance-row estimated alternative">
                    <div className="balance-info">
                        <div className="title">{_t("wallet.estimated")}</div>
                        <div className="description">{_t("wallet.estimated-description")}</div>
                    </div>
                    <div className="balance-values">
                        <div className="amount estimated-value">
                            <FormattedCurrency {...this.props} value={estimatedValue} fixAt={3}/>
                        </div>
                    </div>
                </div>

                <div className="balance-row hive">
                    <div className="balance-info">
                        <div className="title">{_t("wallet.hive")}</div>
                        <div className="description">{_t("wallet.hive-description")}</div>
                    </div>
                    <div className="balance-values">
                        <div className="amount">
                            {(() => {
                                if (isMyPage) {
                                    const dropDownConfig = {
                                        history: this.props.history,
                                        label: '',
                                        items: [
                                            {
                                                label: _t('wallet.transfer'),
                                                onClick: () => {
                                                    this.openTransferDialog('transfer', 'HIVE');
                                                }
                                            },
                                            {
                                                label: _t('wallet.transfer-to-savings'),
                                                onClick: () => {
                                                    this.openTransferDialog('transfer-saving', 'HIVE');
                                                }
                                            },
                                            {
                                                label: _t('wallet.power-up'),
                                                onClick: () => {
                                                    this.openTransferDialog('power-up', 'HIVE');
                                                }
                                            },
                                        ],
                                    };
                                    return <div className="amount-actions">
                                        <DropDown {...dropDownConfig} float="right"/>
                                    </div>;
                                }
                                return null;
                            })()}

                            <span>{formattedNumber(balance, {suffix: "HIVE"})}</span>
                        </div>
                    </div>
                </div>

                <div className="balance-row hive-power alternative">
                    <div className="balance-info">
                        <div className="title">{_t("wallet.hive-power")}</div>
                        <div className="description">{_t("wallet.hive-power-description")}</div>
                    </div>

                    <div className="balance-values">
                        <div className="amount">{formattedNumber(vestsToSp(vestingShares, hivePerMVests), {suffix: "HP"})}</div>

                        {vestingSharesDelegated > 0 && (
                            <div className="amount delegated-shares">
                                <Tooltip content={_t("wallet.hive-power-delegated")}>
                                      <span className="btn-delegated" onClick={this.toggleDelegatedList}>
                                        {formattedNumber(vestsToSp(vestingSharesDelegated, hivePerMVests), {prefix: "-", suffix: "HP"})}
                                      </span>
                                </Tooltip>
                            </div>
                        )}

                        {vestingSharesReceived > 0 && (
                            <div className="amount received-shares">
                                <Tooltip content={_t("wallet.hive-power-received")}>
                                  <span className="btn-delegatee" onClick={this.toggleReceivedList}>
                                    {formattedNumber(vestsToSp(vestingSharesReceived, hivePerMVests), {prefix: "+", suffix: "HP"})}
                                  </span>
                                </Tooltip>
                            </div>
                        )}

                        {vestingSharesWithdrawal > 0 && (
                            <div className="amount next-power-down-amount">
                                <Tooltip content={_t("wallet.next-power-down-amount")}>
                                  <span>
                                    {formattedNumber(vestsToSp(vestingSharesWithdrawal, hivePerMVests), {prefix: "-", suffix: "HP"})}
                                  </span>
                                </Tooltip>
                            </div>
                        )}

                        {(vestingSharesDelegated > 0 || vestingSharesReceived > 0 || vestingSharesWithdrawal > 0) && (
                            <div className="amount total-hive-power">
                                <Tooltip content={_t("wallet.hive-power-total")}>
                                  <span>
                                    {formattedNumber(vestsToSp(vestingSharesTotal, hivePerMVests), {prefix: "=", suffix: "HP"})}
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
                        <div className="amount">
                            {(() => {
                                if (isMyPage) {
                                    const dropDownConfig = {
                                        history: this.props.history,
                                        label: '',
                                        items: [
                                            {
                                                label: _t('wallet.transfer'),
                                                onClick: () => {
                                                    this.openTransferDialog('transfer', 'HBD');
                                                }
                                            },
                                            {
                                                label: _t('wallet.transfer-to-savings'),
                                                onClick: () => {
                                                    this.openTransferDialog('transfer-saving', 'HBD');
                                                }
                                            },
                                            {
                                                label: _t('wallet.convert'),
                                                onClick: () => {
                                                    this.openTransferDialog('convert', 'HBD');
                                                }
                                            },
                                        ],
                                    };

                                    return <div className="amount-actions">
                                        <DropDown {...dropDownConfig} float="right"/>
                                    </div>;
                                }
                                return null;
                            })()}
                            <span>{formattedNumber(hbdBalance, {prefix: "$"})}</span>
                        </div>
                    </div>
                </div>

                <div className="balance-row savings alternative">
                    <div className="balance-info">
                        <div className="title">{_t("wallet.savings")}</div>
                        <div className="description">{_t("wallet.savings-description")}</div>
                    </div>
                    <div className="balance-values">
                        <div className="amount">
                            {(() => {
                                if (isMyPage) {
                                    const dropDownConfig = {
                                        history: this.props.history,
                                        label: '',
                                        items: [
                                            {
                                                label: _t('wallet.withdraw-hive'),
                                                onClick: () => {
                                                    this.openTransferDialog('withdraw-saving', 'HIVE');
                                                }
                                            }
                                        ],
                                    };

                                    return <div className="amount-actions">
                                        <DropDown {...dropDownConfig} float="right"/>
                                    </div>;
                                }
                                return null;
                            })()}
                            <span>{formattedNumber(savingBalance, {suffix: "HIVE"})}</span>
                        </div>
                        <div className="amount">
                            {(() => {
                                if (isMyPage) {
                                    const dropDownConfig = {
                                        history: this.props.history,
                                        label: '',
                                        items: [
                                            {
                                                label: _t('wallet.withdraw-hbd'),
                                                onClick: () => {
                                                    this.openTransferDialog('withdraw-saving', 'HBD');
                                                }
                                            },
                                        ],
                                    };

                                    return <div className="amount-actions">
                                        <DropDown {...dropDownConfig} float="right"/>
                                    </div>;
                                }
                                return null;
                            })()}

                            <span>{formattedNumber(savingBalanceHbd, {suffix: "$"})}</span>
                        </div>
                    </div>
                </div>

                {showPowerDown && (
                    <div className="next-power-down">
                        {_t("wallet.next-power-down", {
                            time: moment(nextVestingWithdrawal).fromNow(),
                            amount: formattedNumber(vestsToSp(vestingSharesWithdrawal, hivePerMVests), {prefix: "HIVE"}),
                        })}
                    </div>
                )}

                {TransactionList({...this.props})}

                {this.state.delegatedList && (
                    <DelegatedVesting {...this.props} account={account} onHide={this.toggleDelegatedList}/>
                )}
                {this.state.receivedList && (
                    <ReceivedVesting {...this.props} account={account} onHide={this.toggleReceivedList}/>
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
        activeUser: p.activeUser,
        transactions: p.transactions,
        account: p.account,
        addAccount: p.addAccount,
        updateActiveUser: p.updateActiveUser
    }

    return <Wallet {...props} />;
}
