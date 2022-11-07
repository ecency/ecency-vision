import React, { useState } from "react";
import { MarketAdvancedModeWidget } from "../../components/market-advanced-mode/market-advanced-mode-widget";

interface Props {}

enum Widget {
  TradingView,
  History,
  TradingForm,
  StakeBuy,
  StakeSell,
  Pairs
}

type ColumnSize = "collapsed" | "expanded";

interface LayoutRow {
  widgetType: Widget;
}

interface LayoutColumn {
  rows: LayoutRow[];
  size: ColumnSize;
}

interface Layout {
  columns: LayoutColumn[];
}

const DEFAULT_LAYOUT: Layout = {
  columns: [
    {
      size: "collapsed",
      rows: [{ widgetType: Widget.StakeSell }, { widgetType: Widget.StakeBuy }]
    },
    {
      size: "expanded",
      rows: [{ widgetType: Widget.TradingView }, { widgetType: Widget.TradingForm }]
    },
    {
      size: "collapsed",
      rows: [{ widgetType: Widget.History }]
    }
  ]
};

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
            {column.rows.map((row, key) => (
              <MarketAdvancedModeWidget
                key={key + row.widgetType}
                children={<div>row.widgetType</div>}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
