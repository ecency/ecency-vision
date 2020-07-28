import React, { Component } from "react";

import moment from "moment";

import { DynamicProps } from "../../store/dynamic-props/types";
import { Transaction, Transactions } from "../../store/transactions/types";

import LinearProgress from "../linear-progress";

import parseAsset from "../../helper/parse-asset";
import parseDate from "../../helper/parse-date";
import { vestsToSp } from "../../helper/vesting";

import formattedNumber from "../../util/formatted-number";

import { ticketSvg, commentSvg, compareHorizontalSvg, cashSvg, reOrderHorizontalSvg } from "../../img/svg";

import { _t } from "../../i18n";

interface RowProps {
  dynamicProps: DynamicProps;
  transaction: Transaction;
}

export class TransactionRow extends Component<RowProps> {
  render() {
    const { dynamicProps, transaction: tr } = this.props;
    const { hivePerMVests } = dynamicProps;

    let flag = false;
    let icon = ticketSvg;
    let numbers = null;
    let details = null;

    if (tr.type === "curation_reward") {
      flag = true;

      numbers = <>{formattedNumber(vestsToSp(parseAsset(tr.reward).amount, hivePerMVests), { suffix: "HP" })}</>;
      details = (
        <span>
          <a href={`/curation/@${tr.comment_author}/${tr.comment_permlink}`}>@{tr.comment_author}/{tr.comment_permlink}</a>  
        </span>
      );
    }

    if (tr.type === "author_reward" || tr.type === "comment_benefactor_reward") {
      flag = true;

      const hbd_payout = parseAsset(tr.sbd_payout);
      const hive_payout = parseAsset(tr.steem_payout);
      const vesting_payout = parseAsset(tr.vesting_payout);
      numbers = (
        <>
          {hbd_payout.amount > 0 && (
            <span className="number">{formattedNumber(hbd_payout.amount, { suffix: "HBD" })}</span>
          )}
          {hive_payout.amount > 0 && (
            <span className="number">{formattedNumber(hive_payout.amount, { suffix: "HIVE" })}</span>
          )}
          {vesting_payout.amount > 0 && (
            <span className="number">
              {formattedNumber(vestsToSp(vesting_payout.amount, hivePerMVests), { suffix: "HP" })}{" "}
            </span>
          )}
        </>
      );

      details = (
        <span>
          <a href={`/reward/@${tr.author}/${tr.permlink}`}>@{tr.author}/{tr.permlink}</a>  
        </span>
      );
    }

    if (tr.type === "comment_benefactor_reward") {
      icon = commentSvg;
    }

    if (tr.type === "claim_reward_balance") {
      flag = true;

      const reward_hbd = parseAsset(tr.reward_sbd || tr.reward_hbd);
      const reward_hive = parseAsset(tr.reward_steem || tr.reward_hive);
      const reward_vests = parseAsset(tr.reward_vests);

      numbers = (
        <>
          {reward_hbd.amount > 0 && (
            <span className="number">{formattedNumber(reward_hbd.amount, { suffix: "HBD" })}</span>
          )}
          {reward_hive.amount > 0 && (
            <span className="number">{formattedNumber(reward_hive.amount, { suffix: "HIVE" })}</span>
          )}
          {reward_vests.amount > 0 && (
            <span className="number">
              {formattedNumber(vestsToSp(reward_vests.amount, hivePerMVests), { suffix: "HP" })}
            </span>
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
              {tr.memo} <br /> <br />
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
          {formattedNumber(vestsToSp(vesting_shares.amount, hivePerMVests), { suffix: "HP" })}
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
        <span className="number">
          {tr.current_pays} = {tr.open_pays}
        </span>
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

interface Props {
  dynamicProps: DynamicProps;
  transactions: Transactions;
}

export default class TransactionList extends Component<Props> {
  render() {
    const { transactions } = this.props;
    const { list, loading } = transactions;

    // Top 50 transaction sorted by id
    const trList = list.slice(Math.max(list.length - 50, 0)).sort((a: any, b: any) => b.num - a.num);

    return (
      <div className="transaction-list">
        <div className="transaction-list-header">
          <h2>{_t("transactions.title")} </h2>
        </div>
        {loading && <LinearProgress />}
        {trList.map((x, k) => (
          <TransactionRow {...this.props} key={k} transaction={x} />
        ))}
      </div>
    );
  }
}
