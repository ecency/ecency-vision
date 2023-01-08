import React from "react";
import { Layout, LayoutColumn, LayoutRow, Widget } from "./types/layout.type";
import { HistoryWidget } from "../../../components/market-advanced-mode/history-widget";
import { StakeWidget } from "../../../components/market-advanced-mode/stake-widget";
import { PairsWidget } from "../../../components/market-advanced-mode/pairs-widget";
import { TradingFormWidget } from "../../../components/market-advanced-mode/trading-form-widget";
import { TradingViewWidget } from "../../../components/market-advanced-mode/trading-view-widget";
import { OpenOrdersWidget } from "../../../components/market-advanced-mode/open-orders-widget";
import { Global } from "../../../store/global/types";
import { ActiveUser } from "../../../store/active-user/types";
import { MarketAsset } from "../../../components/market-swap-form/market-pair";
import { OpenOrdersData, OrdersData } from "../../../api/hive";
import { DayChange } from "./types/day-change.type";
import { History } from "history";
import { updateWidgetType } from "./utils";
import { ToggleType } from "../../../store/ui/types";
import SsrSuspense from "../../../components/ssr-suspense";
import { Transaction } from "../../../store/transactions/types";

interface Props {
  layout: Layout;
  global: Global;
  activeUser: ActiveUser | null;
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  history: OrdersData | null;
  setPrice: (v: number) => void;
  dayChange: DayChange;
  buyBalance: string;
  sellBalance: string;
  price: number;
  browserHistory: History;
  setLayout: (value: Layout) => void;
  toggleUIProp: (value: ToggleType) => void;
  amount: number;
  setAmount: (v: number) => void;
  usdPrice: number;
  onSuccessTrade: () => void;
  openOrdersData: OpenOrdersData[];
  openOrdersDataLoading: boolean;
  setOpenOrders: (data: OpenOrdersData[]) => void;
  setRefresh: (value: boolean) => void;
  allOrders: Transaction[];
}

export const WidgetLayoutBuilder = ({
  layout,
  activeUser,
  global,
  fromAsset,
  toAsset,
  history,
  setPrice,
  dayChange,
  buyBalance,
  sellBalance,
  browserHistory,
  price,
  setLayout,
  toggleUIProp,
  setAmount,
  amount,
  usdPrice,
  onSuccessTrade,
  openOrdersData,
  openOrdersDataLoading,
  setRefresh,
  allOrders
}: Props) => {
  const onWidgetTypeChanged = (uuid: string, previousType: Widget | undefined, newType: Widget) => {
    setLayout(updateWidgetType(layout, uuid, previousType, newType));
  };

  return (
    <div className="widget-layout-builder">
      <HistoryWidget
        browserHistory={browserHistory}
        fromAsset={fromAsset}
        toAsset={toAsset}
        history={history}
        onItemClick={(v) => setPrice(v)}
        widgetTypeChanged={(type) => {}}
      />
      <StakeWidget
        price={dayChange.price}
        usdPrice={usdPrice}
        browserHistory={browserHistory}
        fromAsset={fromAsset}
        toAsset={toAsset}
        history={history}
        widgetTypeChanged={(type) => {}}
        onAmountClick={(v) => setAmount(v)}
        onPriceClick={(v) => setPrice(v)}
      />
      <TradingFormWidget
        amount={amount}
        history={browserHistory}
        activeUser={activeUser}
        global={global}
        dayChange={dayChange}
        buyBalance={buyBalance}
        sellBalance={sellBalance}
        price={price}
        widgetTypeChanged={(type) => {}}
        toggleUIProp={toggleUIProp}
        onSuccessTrade={onSuccessTrade}
      />
      <SsrSuspense fallback={<></>}>
        <TradingViewWidget
          global={global}
          history={browserHistory}
          widgetTypeChanged={(type) => {}}
        />
      </SsrSuspense>
      <OpenOrdersWidget
        allOrders={allOrders}
        history={browserHistory}
        activeUser={activeUser}
        widgetTypeChanged={(type) => {}}
        toggleUIProp={toggleUIProp}
        openOrdersDataLoading={openOrdersDataLoading}
        openOrdersData={openOrdersData}
        setRefresh={setRefresh}
      />
    </div>
  );
};
