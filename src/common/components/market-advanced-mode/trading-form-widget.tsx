import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React from "react";
import { _t } from "../../i18n";

export const TradingFormWidget = () => {
  return (
    <MarketAdvancedModeWidget title={_t("market.advanced.form")} children={<>Its trading form</>} />
  );
};
