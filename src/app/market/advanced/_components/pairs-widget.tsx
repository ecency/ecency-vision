import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React from "react";
import { Widget } from "@/app/market/advanced/_advanced-mode/types/layout.type";
import i18next from "i18next";

export const PairsWidget = () => {
  return (
    <MarketAdvancedModeWidget
      type={Widget.Pairs}
      title={i18next.t("market.advanced.pairs")}
      widgetTypeChanged={() => {}}
    >
      <div />
    </MarketAdvancedModeWidget>
  );
};
