import React, { useState } from "react";
import { DEFAULT_LAYOUT } from "./consts/default-layouts.const";
import { AdvancedModeToolbar } from "./advanced-mode-toolbar";
import { MarketAsset } from "../../../components/market-swap-form/market-pair";
import { MarketObserver } from "./pairs";
import { DayChange } from "./types/day-change.type";
import { DAY_CHANGE_DEFAULT } from "./consts/day-change.const";
import { OpenOrdersData, OrdersData } from "../../../api/hive";
import { ActiveUser } from "../../../store/active-user/types";
import { Global } from "../../../store/global/types";
import { UserBalanceObserver } from "./user-balance-observer";
import { WidgetLayoutBuilder } from "./widget-layout-builder";
import { History } from "history";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { ToggleType } from "../../../store/ui/types";
import { Transaction } from "../../../store/transactions/types";
import GridLayout from "react-grid-layout";
import { MarketMode } from "../market-mode";

interface Props {
  mode: MarketMode;
  setMode: (mode: MarketMode) => void;
  activeUser: ActiveUser | null;
  global: Global;
  browserHistory: History;
  toggleUIProp: (what: ToggleType) => void;
}

export const AdvancedMode = ({
  activeUser,
  global,
  browserHistory,
  toggleUIProp,
  mode,
  setMode
}: Props) => {
  // AMM – advanced mode market
  // AMML – advanced mode market layout
  const [lsLayout, setLsLayout] = useLocalStorage<GridLayout.Layouts>(PREFIX + "_amml");
  const [updateRate, setUpdateRate] = useLocalStorage<number>(PREFIX + "_amm_ur", 10000);

  const [layout, setLayout] = useState<GridLayout.Layouts>(lsLayout ?? DEFAULT_LAYOUT);
  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE);
  const [toAsset, setToAsset] = useState(MarketAsset.HBD);
  const [dayChange, setDayChange] = useState<DayChange>(DAY_CHANGE_DEFAULT);
  const [price, setPrice] = useState(0);
  const [usdPrice, setUsdPrice] = useState(0);
  const [history, setHistory] = useState<OrdersData | null>(null);
  const [buyBalance, setBuyBalance] = useState<string>("0");
  const [sellBalance, setSellBalance] = useState<string>("0");
  const [amount, setAmount] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [openOrdersData, setOpenOrdersData] = useState<OpenOrdersData[]>([]);
  const [openOrdersDataLoading, setOpenOrdersDataLoading] = useState(false);
  const [allOrders, setAllOrders] = useState<Transaction[]>([]);

  return (
    <div className="advanced-mode">
      <MarketObserver
        updateRate={updateRate!}
        setAllOrders={setAllOrders}
        refresh={refresh}
        setRefresh={setRefresh}
        fromAsset={fromAsset}
        toAsset={toAsset}
        onDayChange={(dayChange) => setDayChange(dayChange)}
        onHistoryChange={(history) => setHistory(history)}
        onUsdChange={(usdPrice) => setUsdPrice(usdPrice)}
        setOpenOrdersDataLoading={setOpenOrdersDataLoading}
        setOpenOrders={setOpenOrdersData}
        activeUser={activeUser}
      />
      <UserBalanceObserver
        activeUser={activeUser}
        fromAsset={fromAsset}
        setBuyBalance={(v) => setBuyBalance(v)}
        setSellBalance={(v) => setSellBalance(v)}
      />
      <AdvancedModeToolbar
        global={global}
        fromAsset={fromAsset}
        toAsset={toAsset}
        dayChange={dayChange}
        price={price}
        usdPrice={usdPrice}
        mode={mode}
        setMode={setMode}
        updateRate={updateRate!}
        setUpdateRate={setUpdateRate}
      />
      <div className="advanced-mode-layout">
        <WidgetLayoutBuilder
          allOrders={allOrders}
          usdPrice={usdPrice}
          browserHistory={browserHistory}
          layout={layout}
          activeUser={activeUser}
          global={global}
          price={price}
          amount={amount}
          toAsset={toAsset}
          fromAsset={fromAsset}
          sellBalance={sellBalance}
          buyBalance={buyBalance}
          history={history}
          dayChange={dayChange}
          setPrice={setPrice}
          setAmount={setAmount}
          setLayout={(layout) => {
            setLayout(layout);
            setLsLayout(layout);
          }}
          toggleUIProp={toggleUIProp}
          onSuccessTrade={() => setRefresh(true)}
          openOrdersData={openOrdersData}
          openOrdersDataLoading={openOrdersDataLoading}
          setOpenOrders={setOpenOrdersData}
          setRefresh={setRefresh}
        />
      </div>
    </div>
  );
};
