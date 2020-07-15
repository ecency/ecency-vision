import React, { Component } from "react";

import moment from "moment";

import { Popover, OverlayTrigger } from "react-bootstrap";

import { Entry } from "../../store/entries/types";
import { Global } from "../../store/global/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import FormattedCurrency from "../formatted-currency/index";

import parseAsset from "../../helper/parse-asset";
import parseDate from "../../helper/parse-date";

import { _t } from "../../i18n/index";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  entry: Entry;
}

export class EntryPayoutDetail extends Component<Props> {
  render() {
    const { entry, dynamicProps } = this.props;

    const { base, quote, hbdPrintRate } = dynamicProps;

    const payoutDate = moment(parseDate(entry.payout_at));

    const beneficiary = entry.beneficiaries;
    const pendingPayout = parseAsset(entry.pending_payout_value).amount;
    const promotedPayout = parseAsset(entry.promoted).amount;
    const authorPayout = parseAsset(entry.author_payout_value).amount;
    const curatorPayout = parseAsset(entry.curator_payout_value).amount;

    const HBD_PRINT_RATE_MAX = 10000;
    const percent_hive_dollars = (entry.percent_hbd || entry.percent_steem_dollars) / 20000;
    const pending_payout_hbd = pendingPayout * (percent_hive_dollars);
    const price_per_hive = base / quote;
    const pending_payout_hp = (pendingPayout - pending_payout_hbd) / price_per_hive;
    const pending_payout_printed_hbd = pending_payout_hbd * (hbdPrintRate / HBD_PRINT_RATE_MAX);
    const pending_payout_printed_hive =
      (pending_payout_hbd - pending_payout_printed_hbd) / price_per_hive;
    
    let breakdownPayout = (pending_payout_printed_hbd > 0 ? `${pending_payout_printed_hbd.toFixed(3)} HBD `:'')+(pending_payout_printed_hive > 0 ? `${pending_payout_printed_hive.toFixed(3)} HIVE `:'')+(pending_payout_hp > 0 ? `${pending_payout_hp.toFixed(3)} HP`:'');

    return (
      <div className="payout-popover-content">
        {pendingPayout > 0 && 
          <p>
            <span className="label">{_t("entry-payout.pending-payout")}</span>
            <span className="value">
              <FormattedCurrency {...this.props} value={pendingPayout} fixAt={3} />
            </span>
          </p>
        }
        {promotedPayout > 0 && 
          <p>
            <span className="label">{_t("entry-payout.promoted")}</span>
            <span className="value">
              <FormattedCurrency {...this.props} value={promotedPayout} fixAt={3} />
            </span>
          </p>
        }
        {authorPayout > 0 && 
          <p>
            <span className="label">{_t("entry-payout.author-payout")}</span>
            <span className="value">
              <FormattedCurrency {...this.props} value={authorPayout} fixAt={3} />
            </span>
          </p>
        }
        {curatorPayout > 0 && 
          <p>
            <span className="label">{_t("entry-payout.curators-payout")}</span>
            <span className="value">
              <FormattedCurrency {...this.props} value={curatorPayout} fixAt={3} />
            </span>
          </p>
        }
        {beneficiary.length > 0 && 
          beneficiary.map((key,i) => {
            return (<p key={`beneficiary-${i}`}>
              <span className="label">{_t("entry-payout.beneficiary")}</span>
              <span className="value">
              {key.account}: {(key.weight / 100).toFixed(0)}%
              </span>
            </p>)
          })
        }
        {breakdownPayout && pendingPayout > 0 && (
          <p>
            <span className="label">{_t("entry-payout.breakdown")}</span>
            <span className="value">
              {breakdownPayout}
            </span>
          </p>
        )}
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
      <OverlayTrigger trigger={["hover", "focus"]} overlay={popover} delay={1000}>
        <div className={`entry-payout ${isPayoutDeclined ? "payout-declined" : ""}`}>
          <FormattedCurrency {...this.props} value={totalPayout} />
        </div>
      </OverlayTrigger>
    );
  }
}
