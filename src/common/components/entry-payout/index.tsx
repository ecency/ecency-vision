import React, { Component } from "react";

import moment from "moment";

import { Popover, OverlayTrigger } from "react-bootstrap";

import { Entry } from "../../store/entries/types";
import { State as GlobalState } from "../../store/global/types";

import FormattedCurrency from "../formatted-currency/index";

import parseAsset from "../../helper/parse-asset";
import parseDate from "../../helper/parse-date";

import { _t } from "../../i18n/index";

interface Props {
  global: GlobalState;
  entry: Entry;
}

export class EntryPayoutDetail extends Component<Props> {
  render() {
    const { entry } = this.props;

    const payoutDate = moment(parseDate(entry.payout_at));

    const pendingPayout = parseAsset(entry.pending_payout_value).amount;
    const promotedPayout = parseAsset(entry.promoted).amount;
    const authorPayout = parseAsset(entry.author_payout_value).amount;
    const curatorPayout = parseAsset(entry.curator_payout_value).amount;

    return (
      <div className="payout-popover-content">
        <p>
          <span className="label">{_t("entry-payout.potential-payout")}</span>
          <span className="value">
            <FormattedCurrency {...this.props} value={pendingPayout} fixAt={3} />
          </span>
        </p>
        <p>
          <span className="label">{_t("entry-payout.promoted")}</span>
          <span className="value">
            <FormattedCurrency {...this.props} value={promotedPayout} fixAt={3} />
          </span>
        </p>
        <p>
          <span className="label">{_t("entry-payout.author-payout")}</span>
          <span className="value">
            <FormattedCurrency {...this.props} value={authorPayout} fixAt={3} />
          </span>
        </p>
        <p>
          <span className="label">{_t("entry-payout.curation-payout")}</span>
          <span className="value">
            <FormattedCurrency {...this.props} value={curatorPayout} fixAt={3} />
          </span>
        </p>
        <p>
          <span className="label">{_t("entry-payout.payout-date")}</span>
          <span className="value">{payoutDate.fromNow()}</span>
        </p>
      </div>
    );
  }
}

export default class EntryPayout extends Component<Props> {
  render() {
    const { entry } = this.props;

    const isPayoutDeclined = parseAsset(entry.max_accepted_payout).amount === 0;

    const pendingPayout = parseAsset(entry.pending_payout_value).amount;
    const authorPayout = parseAsset(entry.author_payout_value).amount;
    const curatorPayout = parseAsset(entry.curator_payout_value).amount;

    const totalPayout = pendingPayout + authorPayout + curatorPayout;

    const popover = (
      <Popover id={`payout-popover`}>
        <Popover.Content>
          <EntryPayoutDetail {...this.props} />
        </Popover.Content>
      </Popover>
    );

    return (
      <OverlayTrigger trigger={["hover", "focus"]} overlay={popover}>
        <div className={`entry-payout ${isPayoutDeclined ? "payout-declined" : ""}`}>
          <FormattedCurrency {...this.props} value={totalPayout} />
        </div>
      </OverlayTrigger>
    );
  }
}
