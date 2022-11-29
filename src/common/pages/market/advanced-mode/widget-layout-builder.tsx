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
import { OrdersData } from "../../../api/hive";
import { DayChange } from "./types/day-change.type";

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
  price
}: Props) => {
  const makeRow = (row: LayoutRow): JSX.Element => {
    return <div className="layout-row">{row.columns.map((col) => makeCol(col))}</div>;
  };

  const makeCol = (col: LayoutColumn): JSX.Element => {
    if (col.rows.length > 0) {
      return <div className={"layout-col " + col.size}>{col.rows.map((row) => makeRow(row))}</div>;
    }
    if (col.widgetType) {
      switch (col.widgetType) {
        case Widget.History:
          return (
            <div className={"layout-col " + col.size}>
              <HistoryWidget
                fromAsset={fromAsset}
                toAsset={toAsset}
                history={history}
                onItemClick={(v) => setPrice(v)}
              />
            </div>
          );
        case Widget.Stake:
          return (
            <div className={"layout-col " + col.size}>
              <StakeWidget fromAsset={fromAsset} toAsset={toAsset} history={history} />
            </div>
          );
        case Widget.Pairs:
          return (
            <div className={"layout-col " + col.size}>
              <PairsWidget />
            </div>
          );
        case Widget.TradingForm:
          return (
            <div className={"layout-col " + col.size}>
              <TradingFormWidget
                activeUser={activeUser}
                global={global}
                dayChange={dayChange}
                buyBalance={buyBalance}
                sellBalance={sellBalance}
                price={price}
              />
            </div>
          );
        case Widget.TradingView:
          return (
            <div className={"layout-col " + col.size}>
              <TradingViewWidget />
            </div>
          );
        case Widget.OpenOrders:
          return (
            <div className={"layout-col " + col.size}>
              <OpenOrdersWidget activeUser={activeUser} />
            </div>
          );
        default:
          return <></>;
      }
    }
    return <></>;
  };

  return <>{layout.rows.map((row) => makeRow(row))}</>;
};
