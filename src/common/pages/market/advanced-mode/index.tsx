import React, { useState } from "react";
import { Layout, Widget } from "./layout.type";
import { DEFAULT_LAYOUT } from "./default-layouts.const";
import { HistoryWidget } from "../../../components/market-advanced-mode/history-widget";
import { StakeBuyWidget } from "../../../components/market-advanced-mode/stake-buy-widget";
import { StakeSellWidget } from "../../../components/market-advanced-mode/stake-sell-widget";
import { PairsWidget } from "../../../components/market-advanced-mode/pairs-widget";
import { TradingFormWidget } from "../../../components/market-advanced-mode/trading-form-widget";
import { TradingViewWidget } from "../../../components/market-advanced-mode/trading-view-widget";

interface Props {}

export const AdvancedMode = ({}: Props) => {
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);

  const getGridColumns = () => {
    let cssGridColumns = "";
    layout.columns.forEach((column) => {
      cssGridColumns += column.size === "expanded" ? "2fr " : "1fr ";
    });
    return cssGridColumns.trim();
  };

  return (
    <div className="advanced-mode">
      <div className="advanced-mode-layout" style={{ gridTemplateColumns: getGridColumns() }}>
        {layout.columns.map((column, key) => (
          <div key={key}>
            {column.rows.map((row, key) => {
              switch (row.widgetType) {
                case Widget.History:
                  return <HistoryWidget />;
                case Widget.StakeBuy:
                  return <StakeBuyWidget />;
                case Widget.StakeSell:
                  return <StakeSellWidget />;
                case Widget.Pairs:
                  return <PairsWidget />;
                case Widget.TradingForm:
                  return <TradingFormWidget />;
                case Widget.TradingView:
                  return <TradingViewWidget />;
                default:
                  return <></>;
              }
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
