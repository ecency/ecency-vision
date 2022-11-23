import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React from "react";
import { _t } from "../../i18n";

export const PairsWidget = () => {
  return <MarketAdvancedModeWidget title={_t("market.advanced.pairs")} children={<div></div>} />;
};
