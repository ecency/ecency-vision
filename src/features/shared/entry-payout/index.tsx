import React, { useState } from "react";
import "./_index.scss";
import { Popover, PopoverContent } from "@ui/popover";
import { EntryPayoutDetail } from "@/features/shared/entry-payout/entry-payout-detail";
import { parseAsset } from "@/utils";
import { FormattedCurrency } from "@/features/shared";
import { classNameObject } from "@ui/util";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
}

export const EntryPayout = ({ entry }: Props) => {
  const [showPopover, setShowPopover] = useState(false);

  const check = entry.max_accepted_payout;
  const searchPayout = entry.id || 0; //id exist in search results, post_id in rpc results

  let isPayoutDeclined,
    pendingPayout,
    authorPayout,
    curatorPayout,
    maxPayout,
    totalPayout,
    payoutLimitHit,
    shownPayout;

  if (check) {
    isPayoutDeclined = parseAsset(entry.max_accepted_payout).amount === 0;

    pendingPayout = parseAsset(entry.pending_payout_value).amount;
    authorPayout = parseAsset(entry.author_payout_value).amount;
    curatorPayout = parseAsset(entry.curator_payout_value).amount;
    maxPayout = parseAsset(entry.max_accepted_payout).amount;
    totalPayout = pendingPayout + authorPayout + curatorPayout;
    payoutLimitHit = totalPayout >= maxPayout;
    shownPayout = payoutLimitHit && maxPayout > 0 ? maxPayout : totalPayout;
  }

  if (searchPayout > 0) {
    shownPayout = entry.payout;
  }

  return searchPayout <= 0 ? (
    <div className="noselection">
      <Popover show={showPopover} setShow={setShowPopover}>
        <PopoverContent>
          <EntryPayoutDetail entry={entry} />
        </PopoverContent>
      </Popover>

      <div
        onMouseOver={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        className={classNameObject({
          "entry-payout notranslate": true,
          "payout-declined": isPayoutDeclined,
          "payout-limit-hit": payoutLimitHit
        })}
      >
        <FormattedCurrency value={shownPayout ?? 0} fixAt={3} />
      </div>
    </div>
  ) : (
    <div
      className={classNameObject({
        "entry-payout notranslate": true,
        "payout-declined": isPayoutDeclined,
        "payout-limit-hit": payoutLimitHit
      })}
    >
      <FormattedCurrency value={shownPayout ?? 0} fixAt={3} />
    </div>
  );
};
