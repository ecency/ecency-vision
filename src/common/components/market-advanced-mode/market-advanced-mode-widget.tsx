import React from "react";

interface Props {
  children: JSX.Element;
}

export const MarketAdvancedModeWidget = ({ children }: Props) => {
  return <div className="market-advanced-mode-widget p-3 border">{children}</div>;
};
