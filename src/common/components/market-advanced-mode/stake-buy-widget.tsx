import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React from "react";
import { _t } from "../../i18n";

export const StakeBuyWidget = () => {
  return (
    <MarketAdvancedModeWidget title={_t("market.advanced.buy")} children={<>Its stake buy</>} />
  );
};
