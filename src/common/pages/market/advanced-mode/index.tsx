import React, { useState } from "react";
import { Layout } from "./types/layout.type";
import { DEFAULT_LAYOUT } from "./consts/default-layouts.const";
import { AdvancedModeToolbar } from "./advanced-mode-toolbar";
import { MarketAsset } from "../../../components/market-swap-form/market-pair";
import { MarketObserver } from "./pairs";
import { DayChange } from "./types/day-change.type";
import { DAY_CHANGE_DEFAULT } from "./consts/day-change.const";
import { OrdersData } from "../../../api/hive";
import { ActiveUser } from "../../../store/active-user/types";
import { Global } from "../../../store/global/types";
import { UserBalanceObserver } from "./user-balance-observer";
import { WidgetLayoutBuilder } from "./widget-layout-builder";
import { History } from "history";
import { useLocalStorage } from "react-use";
import { PREFIX } from "../../../util/local-storage";

interface Props {
  activeUser: ActiveUser | null;
  global: Global;
  browserHistory: History;
}

export const AdvancedMode = ({ activeUser, global, browserHistory }: Props) => {
  // AMML – advanced mode market layout
  const [lsLayout, setLsLayout] = useLocalStorage<Layout>(PREFIX + "_amml");

  const [layout, setLayout] = useState<Layout>(lsLayout ?? DEFAULT_LAYOUT);
  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE);
  const [toAsset, setToAsset] = useState(MarketAsset.HBD);
  const [dayChange, setDayChange] = useState<DayChange>(DAY_CHANGE_DEFAULT);
  const [price, setPrice] = useState(0);
  const [usdPrice, setUsdPrice] = useState(0);
  const [history, setHistory] = useState<OrdersData | null>(null);
  const [buyBalance, setBuyBalance] = useState<string>("0");
  const [sellBalance, setSellBalance] = useState<string>("0");

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
      <div className="advanced-mode-layout">
        <WidgetLayoutBuilder
          browserHistory={browserHistory}
          layout={layout}
          activeUser={activeUser}
          global={global}
          price={price}
          toAsset={toAsset}
          fromAsset={fromAsset}
          sellBalance={sellBalance}
          buyBalance={buyBalance}
          history={history}
          dayChange={dayChange}
          setPrice={setPrice}
          setLayout={(layout) => {
            setLayout(layout);
            setLsLayout(layout);
          }}
        />
      </div>
    </div>
  );
};
