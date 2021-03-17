import React, {Component} from "react";

import moment from "moment";

import {History} from "history";

import {FormControl} from "react-bootstrap";

import {DynamicProps} from "../../store/dynamic-props/types";
import {Transaction, Transactions} from "../../store/transactions/types";

import LinearProgress from "../linear-progress";
import EntryLink from "../entry-link";

import parseAsset from "../../helper/parse-asset";
import parseDate from "../../helper/parse-date";
import {vestsToHp} from "../../helper/vesting";

import formattedNumber from "../../util/formatted-number";

import {ticketSvg, commentSvg, compareHorizontalSvg, cashSvg, reOrderHorizontalSvg} from "../../img/svg";

import {_t} from "../../i18n";

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

        if (tr.type === "transfer" || tr.type === "transfer_to_vesting") {
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
        return null;
    }
}


const ALL_TYPES = [
    "curation_reward", "author_reward", "comment_benefactor_reward",
    "claim_reward_balance", "transfer", "transfer_to_vesting", "withdraw_vesting",
    "fill_order"
];

interface Props {
    history: History;
    dynamicProps: DynamicProps;
    transactions: Transactions;
}

interface State {
    type: string
}

export class TransactionList extends Component<Props, State> {
    state: State = {
        type: ""
    }

    typeChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        this.setState({type: e.target.value});
    }

    render() {
        const {transactions} = this.props;
        const {type} = this.state;
        const {list, loading} = transactions;

        let trList: Transaction[] = list.sort((a: any, b: any) => b.num - a.num);

        if (type) {
            trList = trList.filter(x => x.type === type);
        }

        // Top 50 transaction sorted by id
        trList = trList.slice(Math.max(trList.length - 50, 0));

        return (
            <div className="transaction-list">
                <div className="transaction-list-header">
                    <h2>{_t("transactions.title")} </h2>
                    <FormControl as="select" value={type} onChange={this.typeChanged}>
                        <option value="">{_t("transactions.type-all")}</option>
                        {ALL_TYPES.map(x => <option key={x} value={x}>{_t(`transactions.type-${x}`)}</option>)}
                    </FormControl>
                </div>
                {loading && <LinearProgress/>}
                {trList.map((x, k) => (
                    <TransactionRow {...this.props} key={k} transaction={x}/>
                ))}
                {(!loading && trList.length === 0) && <p className="text-muted empty-list">{_t('g.empty-list')}</p>}
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        dynamicProps: p.dynamicProps,
        transactions: p.transactions
    }

    return <TransactionList {...props} />
}
