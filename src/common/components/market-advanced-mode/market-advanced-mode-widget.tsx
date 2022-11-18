import React from "react";
import { MarketAdvancedModeWidgetHeader } from "./market-advanced-mode-widget-header";

interface Props {
  className?: string;
  title?: string;
  children: JSX.Element;
  headerOptions?: JSX.Element;
}

export const MarketAdvancedModeWidget = ({ children, title, headerOptions, className }: Props) => {
  return (
    <div className={"market-advanced-mode-widget border-left border-bottom " + className}>
      <MarketAdvancedModeWidgetHeader title={title} headerOptions={headerOptions} />
      {children}
    </div>
  );
};
