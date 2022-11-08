import React from "react";
import { MarketAdvancedModeWidgetHeader } from "./market-advanced-mode-widget-header";

interface Props {
  children: JSX.Element;
}

export const MarketAdvancedModeWidget = ({ children }: Props) => {
  return (
    <div className="market-advanced-mode-widget">
      <MarketAdvancedModeWidgetHeader title="test" />
      {children}
    </div>
  );
};
