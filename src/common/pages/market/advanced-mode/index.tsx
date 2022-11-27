import React, { useState } from "react";
import { Layout, Widget } from "./types/layout.type";
import { DEFAULT_LAYOUT } from "./consts/default-layouts.const";
import { HistoryWidget } from "../../../components/market-advanced-mode/history-widget";
import { StakeWidget } from "../../../components/market-advanced-mode/stake-widget";
import { PairsWidget } from "../../../components/market-advanced-mode/pairs-widget";
import { TradingFormWidget } from "../../../components/market-advanced-mode/trading-form-widget";
import { TradingViewWidget } from "../../../components/market-advanced-mode/trading-view-widget";
import { AdvancedModeToolbar } from "./advanced-mode-toolbar";
import { MarketAsset } from "../../../components/market-swap-form/market-pair";
import { MarketObserver } from "./pairs";
import { DayChange } from "./types/day-change.type";
import { DAY_CHANGE_DEFAULT } from "./consts/day-change.const";
import { OrdersData } from "../../../api/hive";
import { ActiveUser } from "../../../store/active-user/types";
import { Global } from "../../../store/global/types";
import { UserBalanceObserver } from "./user-balance-observer";

interface Props {
  activeUser: ActiveUser | null;
  global: Global;
}

export const AdvancedMode = ({ activeUser, global }: Props) => {
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);
  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE);
  const [toAsset, setToAsset] = useState(MarketAsset.HBD);
  const [dayChange, setDayChange] = useState<DayChange>(DAY_CHANGE_DEFAULT);
  const [price, setPrice] = useState(0);
  const [usdPrice, setUsdPrice] = useState(0);
  const [history, setHistory] = useState<OrdersData | null>(null);
  const [buyBalance, setBuyBalance] = useState<string>("0");
  const [sellBalance, setSellBalance] = useState<string>("0");

  const getGridColumns = () => {
    let cssGridColumns = "";
    layout.columns.forEach((column) => {
      cssGridColumns += column.size === "expanded" ? "2fr " : "1fr ";
    });
    return cssGridColumns.trim();
  };

  return (
    <div className="advanced-mode">
      <MarketObserver
        fromAsset={fromAsset}
        toAsset={toAsset}
        onDayChange={(dayChange) => setDayChange(dayChange)}
        onHistoryChange={(history) => setHistory(history)}
      />
      <UserBalanceObserver
        activeUser={activeUser}
        fromAsset={fromAsset}
        setBuyBalance={(v) => setBuyBalance(v)}
        setSellBalance={(v) => setSellBalance(v)}
      />
      <AdvancedModeToolbar
        fromAsset={fromAsset}
        toAsset={toAsset}
        dayChange={dayChange}
        price={price}
        usdPrice={usdPrice}
      />
      <div className="advanced-mode-layout" style={{ gridTemplateColumns: getGridColumns() }}>
        {layout.columns.map((column, key) => (
          <div key={key}>
            {column.rows.map((row, key) => {
              switch (row.widgetType) {
                case Widget.History:
                  return (
                    <HistoryWidget
                      fromAsset={fromAsset}
                      toAsset={toAsset}
                      history={history}
                      onItemClick={(v) => setPrice(v)}
                    />
                  );
                case Widget.Stake:
                  return <StakeWidget fromAsset={fromAsset} toAsset={toAsset} history={history} />;
                case Widget.Pairs:
                  return <PairsWidget />;
                case Widget.TradingForm:
                  return (
                    <TradingFormWidget
                      activeUser={activeUser}
                      global={global}
                      dayChange={dayChange}
                      buyBalance={buyBalance}
                      sellBalance={sellBalance}
                      price={price}
                    />
                  );
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
