import React from "react";
import { ActiveUser } from "../../store/active-user/types";
import { _t } from "../../i18n";
import { externalLink } from "../../img/svg";

interface Props {
  activeUser: ActiveUser | null;
}

export const InsufficientResourceCreditsDetails = ({ activeUser }: Props) => {
  return (
    <div className="insufficient-resource-credits-details">
      <p className="mb-4">{_t("feedback-modal.insufficient-resource-title")}</p>
      <div className="rounded-xl border border-[--border-color] market-swap-active-orders">
        <div
          className="border-b border-[--border-color] px-4 py-3 cursor-pointer"
          onClick={() =>
            window.open(`/purchase?username=${activeUser?.username}&type=boost`, "_blank")
          }
        >
          {_t("feedback-modal.insufficient-resource-purchase")} {externalLink}
        </div>
        <div
          className="border-b border-[--border-color] px-4 py-3 cursor-pointer"
          onClick={() => window.open("/faq#what-powering-up", "_blank")}
        >
          {_t("feedback-modal.insufficient-resource-buy-hive")} {externalLink}
        </div>
        <div
          className="border-b border-[--border-color] px-4 py-3 cursor-pointer"
          onClick={() => window.open("/faq#what-are-rc", "_blank")}
        >
          {_t("feedback-modal.insufficient-resource-wait")} {externalLink}
        </div>
      </div>
    </div>
  );
};
