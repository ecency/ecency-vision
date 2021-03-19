import React, {Component} from "react";

import moment from "moment";

import {History} from "history";

import {FormControl} from "react-bootstrap";

import {DynamicProps} from "../../store/dynamic-props/types";
import {OperationGroup, Transaction, Transactions} from "../../store/transactions/types";
import {Account} from "../../store/accounts/types";

import LinearProgress from "../linear-progress";
import EntryLink from "../entry-link";

import parseAsset from "../../helper/parse-asset";
import parseDate from "../../helper/parse-date";
import {vestsToHp} from "../../helper/vesting";

import formattedNumber from "../../util/formatted-number";

import {ticketSvg, commentSvg, compareHorizontalSvg, cashSvg, cashMultiple, reOrderHorizontalSvg, pickAxeSvg, closeSvg, arrowRightSvg} from "../../img/svg";

import {_t} from "../../i18n";
import {Tsx} from "../../i18n/helper";

interface RowProps {
    history: History;
    dynamicProps: DynamicProps;
    transaction: Transaction;
}

export class TransactionRow extends Component<RowProps> {
    render() {
        const {dynamicProps, transaction: tr} = this.props;
        const {hivePerMVests} = dynamicProps;

        let flag = false;
        let icon = ticketSvg;
        let numbers = null;
        let details = null;

        if (tr.type === "curation_reward") {
            flag = true;

            numbers = <>{formattedNumber(vestsToHp(parseAsset(tr.reward).amount, hivePerMVests), {suffix: "HP"})}</>;
            details = EntryLink({
                ...this.props,
                entry: {
                    category: "ecency",
                    author: tr.comment_author,
                    permlink: tr.comment_permlink
                },
                children: <span>{"@"}{tr.comment_author}/{tr.comment_permlink}</span>
            })
        }

        if (tr.type === "author_reward" || tr.type === "comment_benefactor_reward") {
            flag = true;

            const hbd_payout = parseAsset(tr.hbd_payout);
            const hive_payout = parseAsset(tr.hive_payout);
            const vesting_payout = parseAsset(tr.vesting_payout);
            numbers = (
                <>
                    {hbd_payout.amount > 0 && (
                        <span className="number">{formattedNumber(hbd_payout.amount, {suffix: "HBD"})}</span>
                    )}
                    {hive_payout.amount > 0 && (
                        <span className="number">{formattedNumber(hive_payout.amount, {suffix: "HIVE"})}</span>
                    )}
                    {vesting_payout.amount > 0 && (
                        <span className="number">{formattedNumber(vestsToHp(vesting_payout.amount, hivePerMVests), {suffix: "HP"})}{" "}</span>
                    )}
                </>
            );

            details = EntryLink({
                ...this.props,
                entry: {
                    category: "ecency",
                    author: tr.author,
                    permlink: tr.permlink
                },
                children: <span>{"@"}{tr.author}/{tr.permlink}</span>
            });
        }

        if (tr.type === "comment_benefactor_reward") {
            icon = commentSvg;
        }

        if (tr.type === "claim_reward_balance") {
            flag = true;

            const reward_hbd = parseAsset(tr.reward_hbd);
            const reward_hive = parseAsset(tr.reward_hive);
            const reward_vests = parseAsset(tr.reward_vests);

            numbers = (
                <>
                    {reward_hbd.amount > 0 && (
                        <span className="number">{formattedNumber(reward_hbd.amount, {suffix: "HBD"})}</span>
                    )}
                    {reward_hive.amount > 0 && (
                        <span className="number">{formattedNumber(reward_hive.amount, {suffix: "HIVE"})}</span>
                    )}
                    {reward_vests.amount > 0 && (
                        <span className="number">{formattedNumber(vestsToHp(reward_vests.amount, hivePerMVests), {suffix: "HP"})}</span>
                    )}
                </>
            );
        }

        if (tr.type === "transfer" || tr.type === "transfer_to_vesting" || tr.type == "transfer_to_savings") {
            flag = true;
            icon = compareHorizontalSvg;

            details = (
                <span>
                    {tr.memo ? (
                        <>
                            {tr.memo} <br/> <br/>
                        </>
                    ) : null}
                    <strong>@{tr.from}</strong> -&gt; <strong>@{tr.to}</strong>
                </span>
            );

            numbers = <span className="number">{tr.amount}</span>;
        }

        if (tr.type === "cancel_transfer_from_savings") {
            flag = true;
            icon = closeSvg;

            details = <Tsx k="transactions.type-cancel_transfer_from_savings-detail" args={{from: tr.from, request: tr.request_id}}>
                <span/>
            </Tsx>
        }

        if (tr.type === "withdraw_vesting") {
            flag = true;
            icon = cashSvg;

            const vesting_shares = parseAsset(tr.vesting_shares);
            numbers = (
                <span className="number">
                    {formattedNumber(vestsToHp(vesting_shares.amount, hivePerMVests), {suffix: "HP"})}
                </span>
            );

            details = tr.acc ? (
                <span>
                    <strong>@{tr.acc}</strong>
                </span>
            ) : null;
        }

        if (tr.type === "fill_order") {
            flag = true;
            icon = reOrderHorizontalSvg;

            numbers = (
                <span className="number">{tr.current_pays} = {tr.open_pays}</span>
            );
        }

        if (tr.type === "producer_reward") {
            flag = true;
            icon = pickAxeSvg;

            numbers = <>{formattedNumber(vestsToHp(parseAsset(tr.vesting_shares).amount, hivePerMVests), {suffix: "HP"})}</>
        }

        if (tr.type === "interest") {
            flag = true;
            icon = cashMultiple;

            numbers = <span className="number">{tr.interest}</span>
        }

        if (tr.type === "fill_convert_request") {
            flag = true;
            icon = reOrderHorizontalSvg;

            numbers = <span className="number">{tr.amount_in} = {tr.amount_out}</span>
        }

        if (tr.type === "return_vesting_delegation") {
            flag = true;
            icon = arrowRightSvg;

            numbers = <>{formattedNumber(vestsToHp(parseAsset(tr.vesting_shares).amount, hivePerMVests), {suffix: "HP"})}</>
        }

        if (tr.type === "proposal_pay") {
            flag = true;
            icon = ticketSvg;

            numbers = <span className="number">{tr.payment}</span>
        }

        if (flag) {
            const transDate = parseDate(tr.timestamp);

            return (
                <div className="transaction-list-item">
                    <div className="transaction-icon">{icon}</div>
                    <div className="transaction-title">
                        <div className="transaction-name">{_t(`transactions.type-${tr.type}`)}</div>
                        <div className="transaction-date">{moment(transDate).fromNow()}</div>
                    </div>
                    <div className="transaction-numbers">{numbers}</div>
                    <div className="transaction-details">{details}</div>
                </div>
            );
        }

        return <div className="transaction-list-item transaction-list-item-raw">
            <div className="raw-code">{JSON.stringify(tr)}</div>
        </div>;
    }
}

interface Props {
    history: History;
    dynamicProps: DynamicProps;
    transactions: Transactions;
    account: Account;
    fetchTransactions: (username: string, group?: OperationGroup | "") => void;
}

export class TransactionList extends Component<Props> {
    typeChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const {account, fetchTransactions} = this.props;
        const group = e.target.value;

        fetchTransactions(account.name, group as OperationGroup);
    }

    render() {
        const {transactions} = this.props;
        const {list, loading, group} = transactions;

        return (
            <div className="transaction-list">
                <div className="transaction-list-header">
                    <h2>{_t("transactions.title")} </h2>
                    <FormControl as="select" value={group} onChange={this.typeChanged}>
                        <option value="">{_t("transactions.group-all")}</option>
                        {["transfers", "market-orders", "interests", "stake-operations", "rewards"].map(x =>
                            <option key={x} value={x}>{_t(`transactions.group-${x}`)}</option>)}
                    </FormControl>
                </div>
                {loading && <LinearProgress/>}
                {list.map((x, k) => (
                    <TransactionRow {...this.props} key={k} transaction={x}/>
                ))}
                {(!loading && list.length === 0) && <p className="text-muted empty-list">{_t('g.empty-list')}</p>}
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        dynamicProps: p.dynamicProps,
        transactions: p.transactions,
        account: p.account,
        fetchTransactions: p.fetchTransactions
    }

    return <TransactionList {...props} />
}
