import React, { Fragment } from "react";
import { Entry } from "@/entities";
import i18next from "i18next";
import { FormattedCurrency } from "@/features/shared";
import { dateToFullRelative, formattedNumber, parseAsset } from "@/utils";
import { getDynamicPropsQuery } from "@/api/queries";

interface Props {
  entry: Entry;
}

export function EntryPayoutDetail({ entry }: Props) {
  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();

  const { base, quote, hbdPrintRate } = dynamicProps!;

  const payoutDate = dateToFullRelative(entry.payout_at);

  const beneficiary = entry.beneficiaries;
  const pendingPayout = parseAsset(entry.pending_payout_value).amount;
  const promotedPayout = parseAsset(entry.promoted).amount;
  const authorPayout = parseAsset(entry.author_payout_value).amount;
  const curatorPayout = parseAsset(entry.curator_payout_value).amount;
  const maxPayout = parseAsset(entry.max_accepted_payout).amount;
  const fullPower = entry.percent_hbd === 0;

  const totalPayout = pendingPayout + authorPayout + curatorPayout;
  const payoutLimitHit = totalPayout >= maxPayout;

  const HBD_PRINT_RATE_MAX = 10000;
  const percentHiveDollars = entry.percent_hbd / 20000;
  const pendingPayoutHbd = pendingPayout * percentHiveDollars;
  const pricePerHive = base / quote;
  const pendingPayoutHp = (pendingPayout - pendingPayoutHbd) / pricePerHive;
  const pendingPayoutPrintedHbd = pendingPayoutHbd * (hbdPrintRate / HBD_PRINT_RATE_MAX);
  const pendingPayoutPrintedHive = (pendingPayoutHbd - pendingPayoutPrintedHbd) / pricePerHive;

  let breakdownPayout: string[] = [];
  if (pendingPayout > 0) {
    if (pendingPayoutPrintedHbd > 0) {
      breakdownPayout.push(
        formattedNumber(pendingPayoutPrintedHbd, { fractionDigits: 3, suffix: "HBD" })
      );
    }

    if (pendingPayoutPrintedHive > 0) {
      breakdownPayout.push(
        formattedNumber(pendingPayoutPrintedHive, { fractionDigits: 3, suffix: "HIVE" })
      );
    }

    if (pendingPayoutHp > 0) {
      breakdownPayout.push(formattedNumber(pendingPayoutHp, { fractionDigits: 3, suffix: "HP" }));
    }
  }

  return (
    <div className="payout-popover-content">
      {fullPower && (
        <p>
          <span className="label">{i18next.t("entry-payout.reward")}</span>
          <span className="value">{i18next.t("entry-payout.full-power")}</span>
        </p>
      )}
      {pendingPayout > 0 && (
        <p>
          <span className="label">{i18next.t("entry-payout.pending-payout")}</span>
          <span className="value">
            <FormattedCurrency value={pendingPayout} fixAt={3} />
          </span>
        </p>
      )}
      {promotedPayout > 0 && (
        <p>
          <span className="label">{i18next.t("entry-payout.promoted")}</span>
          <span className="value">
            <FormattedCurrency value={promotedPayout} fixAt={3} />
          </span>
        </p>
      )}
      {authorPayout > 0 && (
        <p>
          <span className="label">{i18next.t("entry-payout.author-payout")}</span>
          <span className="value">
            <FormattedCurrency value={authorPayout} fixAt={3} />
          </span>
        </p>
      )}
      {curatorPayout > 0 && (
        <p>
          <span className="label">{i18next.t("entry-payout.curators-payout")}</span>
          <span className="value">
            <FormattedCurrency value={curatorPayout} fixAt={3} />
          </span>
        </p>
      )}
      {beneficiary.length > 0 && (
        <p>
          <span className="label">{i18next.t("entry-payout.beneficiary")}</span>
          <span className="value">
            {beneficiary.map((x, i) => (
              <Fragment key={i}>
                {x.account}: {(x.weight / 100).toFixed(0)}% <br />
              </Fragment>
            ))}
          </span>
        </p>
      )}
      {breakdownPayout.length > 0 && (
        <p>
          <span className="label">{i18next.t("entry-payout.breakdown")}</span>
          <span className="value">
            {breakdownPayout.map((x, i) => (
              <Fragment key={i}>
                {x} <br />
              </Fragment>
            ))}
          </span>
        </p>
      )}
      <p>
        <span className="label">{i18next.t("entry-payout.payout-date")}</span>
        <span className="value">{payoutDate}</span>
      </p>
      {payoutLimitHit && (
        <p>
          <span className="label">{i18next.t("entry-payout.max-accepted")}</span>
          <span className="value">
            <FormattedCurrency value={maxPayout} fixAt={3} />
          </span>
        </p>
      )}
    </div>
  );
}
