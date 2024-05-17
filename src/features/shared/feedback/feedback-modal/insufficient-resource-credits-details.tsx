import React from "react";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { externalLink } from "@ui/svg";

export const InsufficientResourceCreditsDetails = () => {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return (
    <div className="insufficient-resource-credits-details">
      <p className="mb-4">{i18next.t("feedback-modal.insufficient-resource-title")}</p>
      <div className="rounded-xl border border-[--border-color] market-swap-active-orders">
        <div
          className="border-b border-[--border-color] px-4 py-3 cursor-pointer"
          onClick={() =>
            window.open(`/purchase?username=${activeUser?.username}&type=boost`, "_blank")
          }
        >
          {i18next.t("feedback-modal.insufficient-resource-purchase")} {externalLink}
        </div>
        <div
          className="border-b border-[--border-color] px-4 py-3 cursor-pointer"
          onClick={() => window.open("/faq#what-powering-up", "_blank")}
        >
          {i18next.t("feedback-modal.insufficient-resource-buy-hive")} {externalLink}
        </div>
        <div
          className="border-b border-[--border-color] px-4 py-3 cursor-pointer"
          onClick={() => window.open("/faq#what-are-rc", "_blank")}
        >
          {i18next.t("feedback-modal.insufficient-resource-wait")} {externalLink}
        </div>
      </div>
    </div>
  );
};
