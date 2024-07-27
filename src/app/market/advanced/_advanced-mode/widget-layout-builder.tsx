import React, { useState } from "react";
import { DayChange } from "./types/day-change.type";
import GridLayout from "react-grid-layout";
import ReactGridLayout, { Responsive, WidthProvider } from "react-grid-layout";
import { MarketAsset } from "@/features/market/market-swap-form/market-pair";
import { OpenOrdersData, OrdersData, Transaction } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { HistoryWidget } from "@/app/market/advanced/_components/history-widget";
import { StakeWidget } from "@/app/market/advanced/_components/stake-widget";
import { TradingFormWidget } from "@/app/market/advanced/_components/trading-form-widget";
import { TradingViewWidget } from "@/app/market/advanced/_components/trading-view-widget";
import { OpenOrdersWidget } from "@/app/market/advanced/_components/open-orders-widget";

interface Props {
  layout: GridLayout.Layouts;
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  history: OrdersData | null;
  setPrice: (v: number) => void;
  dayChange: DayChange;
  buyBalance: string;
  sellBalance: string;
  price: number;
  setLayout: (value: GridLayout.Layouts) => void;
  amount: number;
  setAmount: (v: number) => void;
  usdPrice: number;
  onSuccessTrade: () => void;
  openOrdersData: OpenOrdersData[];
  setOpenOrders: (data: OpenOrdersData[]) => void;
  setRefresh: (value: boolean) => void;
  allOrders: Transaction[];
}

const ResponsiveGridLayout = WidthProvider(Responsive);

export const WidgetLayoutBuilder = ({
  layout,
  fromAsset,
  toAsset,
  history,
  setPrice,
  dayChange,
  buyBalance,
  sellBalance,
  price,
  setLayout,
  setAmount,
  amount,
  usdPrice,
  onSuccessTrade,
  openOrdersData,
  setRefresh,
  allOrders
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");

  const onWidgetTypeChanged = (currentType: string, newType: string) => {
    const layoutCopy: ReactGridLayout.Layouts = JSON.parse(JSON.stringify(layout));
    const index = layoutCopy[currentBreakpoint]?.findIndex((item) => item.i === currentType);
    if (index > -1 && layoutCopy[currentBreakpoint]) {
      layoutCopy[currentBreakpoint][index].i = newType;
    }
    Object.keys(layoutCopy);
    setLayout(layoutCopy);
  };

  return (
    <ResponsiveGridLayout
      className="widget-layout-builder"
      layouts={layout}
      breakpoints={{ lg: 1200, md: 996, sm: 768 }}
      cols={{ lg: 12, md: 2, sm: 3 }}
      compactType="vertical"
      containerPadding={[0, 0]}
      margin={[0, 0]}
      measureBeforeMount={false}
      draggableHandle=".deck-index"
      onBreakpointChange={(bp) => setCurrentBreakpoint(bp)}
      onLayoutChange={(layout, layouts) => setLayout(layouts)}
    >
      <div key="h">
        <HistoryWidget
          fromAsset={fromAsset}
          toAsset={toAsset}
          history={history}
          onItemClick={(v) => setPrice(v)}
          widgetTypeChanged={(type) => onWidgetTypeChanged("h", type)}
        />
      </div>
      <div key="s">
        <StakeWidget
          price={dayChange.price}
          usdPrice={usdPrice}
          fromAsset={fromAsset}
          toAsset={toAsset}
          history={history}
          widgetTypeChanged={(type) => onWidgetTypeChanged("s", type)}
          onAmountClick={(v) => setAmount(v)}
          onPriceClick={(v) => setPrice(v)}
        />
      </div>
      <div key="tf">
        <TradingFormWidget
          amount={amount}
          dayChange={dayChange}
          buyBalance={buyBalance}
          sellBalance={sellBalance}
          price={price}
          widgetTypeChanged={(type) => onWidgetTypeChanged("tf", type)}
          onSuccessTrade={onSuccessTrade}
        />
      </div>
      <div key="tv">
        <TradingViewWidget widgetTypeChanged={(type) => onWidgetTypeChanged("tv", type)} />
      </div>
      <div key="oo">
        <OpenOrdersWidget
          allOrders={allOrders}
          widgetTypeChanged={(type) => onWidgetTypeChanged("oo", type)}
          openOrdersData={openOrdersData}
          setRefresh={setRefresh}
        />
      </div>
    </ResponsiveGridLayout>
  );
};
