import React, { Component } from "react";

import { DynamicProps } from "../../store/dynamic-props/types";
import { Transaction, State as TransactionState } from "../../store/transactions/types";

import formattedNumber from "../../util/formatted-number";

import parseAsset from "../../helper/parse-asset";
import parseDate from "../../helper/parse-date";
import { vestsToSp } from "../../helper/vesting";
import transactions from "../../store/transactions";

interface RowProps {
  dynamicProps: DynamicProps;
  transaction: Transaction;
}

export class TransactionRow extends Component<RowProps> {
  render() {
    const { dynamicProps, transaction: tr } = this.props;
    const { hivePerMVests } = dynamicProps;

    let flag = false;
    let icon = "local_activity";
    let numbers;
    let details;

    if (tr.type === "curation_reward") {
      numbers = <>{formattedNumber(vestsToSp(parseAsset(tr.reward).amount, hivePerMVests), { suffix: "HP" })}</>;
      details = `@${tr.comment_author}/${tr.comment_permlink}`;
    }

    if (tr.type === "author_reward" || tr.type === "comment_benefactor_reward") {
      tr.vesting_payout;

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

      details = `@${tr.author}/${tr.permlink}`;
    }

    return "ok";
  }
}

interface Props {
  dynamicProps: DynamicProps;
  transactions: TransactionState;
}

export default class Transactions extends Component<Props> {
  render() {
    const { transactions } = this.props;

    const { list } = transactions;

    if (list.length === 0) {
      return null;
    }

    return (
      <div className="transactions">
        {list.map((x, k) => (
          <TransactionRow {...this.props} key={k} transaction={x} />
        ))}
      </div>
    );
  }
}
