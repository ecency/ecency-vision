import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React, { useEffect, useState } from "react";
import { _t } from "../../i18n";
import { OrdersData } from "../../api/hive";
import moment, { Moment } from "moment";
import { MarketAsset } from "../market-swap-form/market-pair";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";
import { AutoSizer, List } from "react-virtualized";

interface Props {
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  browserHistory: History;
  history: OrdersData | null;
  onItemClick: (value: number) => void;
  widgetTypeChanged: (type: Widget) => void;
}

interface Item {
  amount: number;
  price: number;
  action: "sell" | "buy";
  date: Moment;
}

export const HistoryWidget = ({
  history,
  browserHistory,
  fromAsset,
  toAsset,
  onItemClick,
  widgetTypeChanged
}: Props) => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!history) return;

    const newItems: Item[] = [];
    history.asks.forEach((ask) =>
      newItems.push({
        amount: ask.hive / 1000,
        price: ask.hbd / 1000,
        action: "sell",
        date: moment(ask.created)
      })
    );
    history.bids.forEach((bid) =>
      newItems.push({
        amount: bid.hive / 1000,
        price: bid.hbd / 1000,
        action: "buy",
        date: moment(bid.created)
      })
    );

    newItems.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());
    setItems(newItems);
  }, [history]);

  const getDate = (date: Moment) => {
    const now = moment(new Date());
    const isSameDay = now.isSame(date, "days");
    const isSameMonth = now.isSame(date, "months");
    const isSameYear = now.isSame(date, "years");

    if (isSameDay && isSameMonth && isSameYear) {
      return date.format("HH:mm:ss");
    } else if (isSameYear) {
      return date.format("DD MMM");
    } else {
      return date.format("DD.MM.YYYY");
    }
  };

  return (
    <MarketAdvancedModeWidget
      history={browserHistory}
      className="market-advanced-mode-history-widget"
      type={Widget.History}
      title={_t("market.advanced.history")}
      children={
        <div className="history-widget-content">
          <div className="history-widget-row history-widget-header">
            <div>
              {_t("market.advanced.history-widget.price")}({toAsset})
            </div>
            <div>
              {_t("market.advanced.history-widget.amount")}({fromAsset})
            </div>
            <div>{_t("market.advanced.history-widget.time")}</div>
          </div>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                rowCount={items.length}
                rowHeight={19}
                rowRenderer={({ key, index, style }) => (
                  <div
                    className="history-widget-row selectable"
                    style={style}
                    key={key}
                    onClick={() => onItemClick(items[index].price / items[index].amount)}
                  >
                    <div className={items[index].action === "buy" ? "text-green" : "text-red"}>
                      {(items[index].price / items[index].amount).toFixed(5)}
                    </div>
                    <div>{items[index].amount}</div>
                    <div>{getDate(items[index].date)}</div>
                  </div>
                )}
              />
            )}
          </AutoSizer>
        </div>
      }
      widgetTypeChanged={widgetTypeChanged}
    />
  );
};
