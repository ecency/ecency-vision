import React from "react";
import { HistoryWidget } from "../../../components/market-advanced-mode/history-widget";
import { StakeWidget } from "../../../components/market-advanced-mode/stake-widget";
import { TradingFormWidget } from "../../../components/market-advanced-mode/trading-form-widget";
import { TradingViewWidget } from "../../../components/market-advanced-mode/trading-view-widget";
import { OpenOrdersWidget } from "../../../components/market-advanced-mode/open-orders-widget";
import { Global } from "../../../store/global/types";
import { ActiveUser } from "../../../store/active-user/types";
import { MarketAsset } from "../../../components/market-swap-form/market-pair";
import { OpenOrdersData, OrdersData } from "../../../api/hive";
import { DayChange } from "./types/day-change.type";
import { History } from "history";
import { ToggleType } from "../../../store/ui/types";
import SsrSuspense from "../../../components/ssr-suspense";
import { Transaction } from "../../../store/transactions/types";
import GridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import ReactGridLayout from "react-grid-layout";

interface Props {
  layout: GridLayout.Layouts;
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
  setLayout: (value: GridLayout.Layouts) => void;
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

const ResponsiveGridLayout = WidthProvider(Responsive);

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
  const onWidgetTypeChanged = (currentType: string, newType: string) => {
    const layoutCopy: ReactGridLayout.Layouts = JSON.parse(JSON.stringify(layout));
    layoutCopy;
  };

  return (
    <ResponsiveGridLayout
      className="widget-layout-builder"
      layouts={layout}
      breakpoints={{ lg: 1200, md: 996, sm: 768 }}
      cols={{ lg: 12, md: 2, sm: 1 }}
      compactType="vertical"
      containerPadding={[0, 0]}
      margin={[0, 0]}
      measureBeforeMount={false}
      draggableHandle=".deck-index"
      onLayoutChange={(layout, layouts) => setLayout(layouts)}
    >
      <div key="h">
        <HistoryWidget
          browserHistory={browserHistory}
          fromAsset={fromAsset}
          toAsset={toAsset}
          history={history}
          onItemClick={(v) => setPrice(v)}
          widgetTypeChanged={(type) => {}}
        />
      </div>
      <div key="s">
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
      </div>
      <div key="tf">
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
      </div>
      <div key="tv">
        <SsrSuspense fallback={<></>}>
          <TradingViewWidget
            global={global}
            history={browserHistory}
            widgetTypeChanged={(type) => {}}
          />
        </SsrSuspense>
      </div>
      <div key="oo">
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
    </ResponsiveGridLayout>
  );
};
