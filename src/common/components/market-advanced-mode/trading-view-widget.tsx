import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React from "react";
import { _t } from "../../i18n";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";

interface Props {
  history: History;
}

export const TradingViewWidget = ({ history }: Props) => {
  return (
    <MarketAdvancedModeWidget
      history={history}
      type={Widget.TradingView}
      title={_t("market.advanced.chart")}
      children={<>Its trading view</>}
      widgetTypeChanged={() => {}}
    />
  );
};
