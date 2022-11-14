import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React from "react";
import { _t } from "../../i18n";

export const TradingViewWidget = () => {
  return (
    <MarketAdvancedModeWidget
      title={_t("market.advanced.chart")}
      children={<>Its trading view</>}
    />
  );
};
