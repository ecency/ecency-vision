import { PointTransaction } from "@/entities";
import React from "react";
import {
  accountGroupSvg,
  accountOutlineSvg,
  cashSvg,
  checkAllSvg,
  chevronUpSvg,
  commentSvg,
  compareHorizontalSvg,
  gpsSvg,
  pencilOutlineSvg,
  repeatSvg,
  starOutlineSvg,
  ticketSvg
} from "@/assets/img/svg";
import { formatMemo } from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components";
import { TransactionType } from "@/enums";
import { dateToFullRelative } from "@/utils";
import i18next from "i18next";

interface Props {
  tr: PointTransaction;
}

export function WalletEcencyTransactionRow({ tr }: Props) {
  let icon: JSX.Element | null = null;
  let lKey = "";
  const lArgs = { n: "" };

  switch (tr.type) {
    case TransactionType.CHECKIN:
      icon = starOutlineSvg;
      lKey = "checkin";
      break;
    case TransactionType.LOGIN:
      icon = accountOutlineSvg;
      lKey = "login";
      break;
    case TransactionType.CHECKIN_EXTRA:
      icon = checkAllSvg;
      lKey = "checkin-extra";
      break;
    case TransactionType.POST:
      icon = pencilOutlineSvg;
      lKey = "post";
      break;
    case TransactionType.COMMENT:
      icon = commentSvg;
      lKey = "comment";
      break;
    case TransactionType.VOTE:
      icon = chevronUpSvg;
      lKey = "vote";
      break;
    case TransactionType.REBLOG:
      icon = repeatSvg;
      lKey = "reblog";
      break;
    case TransactionType.DELEGATION:
      icon = ticketSvg;
      lKey = "delegation";
      break;
    case TransactionType.REFERRAL:
      icon = gpsSvg;
      lKey = "referral";
      break;
    case TransactionType.COMMUNITY:
      icon = accountGroupSvg;
      lKey = "community";
      break;
    case TransactionType.TRANSFER_SENT:
      icon = compareHorizontalSvg;
      lKey = "transfer-sent";
      lArgs.n = tr.receiver!;
      break;
    case TransactionType.TRANSFER_INCOMING:
      icon = compareHorizontalSvg;
      lKey = "transfer-incoming";
      lArgs.n = tr.sender!;
      break;
    case TransactionType.MINTED:
      icon = cashSvg;
      break;
    default:
  }

  const dateRelative = dateToFullRelative(tr.created);

  return (
    <div className="transaction-list-item">
      <div className="transaction-icon">{icon}</div>
      <div className="transaction-title">
        <div className="transaction-name">
          {lKey && i18next.t(`points.${lKey}-list-desc`, { ...lArgs })}
          {!lKey && <span>&nbsp;</span>}
        </div>
        <div className="transaction-date">{dateRelative}</div>
      </div>
      {tr.memo && <div className="transaction-details user-selectable">{formatMemo(tr.memo)}</div>}
      <div className="transaction-numbers">{tr.amount}</div>
    </div>
  );
}
