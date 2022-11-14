import React from "react";
import { MarketAdvancedModeWidgetHeader } from "./market-advanced-mode-widget-header";

interface Props {
  title: string;
  children: JSX.Element;
}

export const MarketAdvancedModeWidget = ({ children, title }: Props) => {
  return (
    <div className="market-advanced-mode-widget border-left border-bottom">
      <MarketAdvancedModeWidgetHeader title={title} />
      {children}
    </div>
  );
};
