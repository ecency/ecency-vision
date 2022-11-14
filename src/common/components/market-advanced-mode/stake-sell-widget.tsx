import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React from "react";
import { _t } from "../../i18n";

export const StakeSellWidget = () => {
  return (
    <MarketAdvancedModeWidget title={_t("market.advanced.sell")} children={<>Its stake sell</>} />
  );
};
