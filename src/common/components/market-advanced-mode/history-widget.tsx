import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React, { useEffect, useState } from "react";
import { _t } from "../../i18n";
import { OrdersData } from "../../api/hive";
import moment, { Moment } from "moment";
import { MarketAsset } from "../market-swap-form/market-pair";

interface Props {
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  history: OrdersData | null;
}

interface Item {
  amount: number;
  price: number;
  action: "sell" | "buy";
  date: Moment;
}

export const HistoryWidget = ({ history, fromAsset, toAsset }: Props) => {
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
    const now = moment();
    const isSameDay = now.day() === date.day();
    const isSameMonth = now.month() === date.month();
    const isSameYear = now.year() === date.year();

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
      title={_t("market.advanced.history")}
      children={
        <div className="history-widget-content">
          <div className="history-widget-row history-widget-header">
            <div>
              {_t("market.advanced.history-widget.price")}({fromAsset})
            </div>
            <div>
              {_t("market.advanced.history-widget.amount")}({toAsset})
            </div>
            <div>{_t("market.advanced.history-widget.time")}</div>
          </div>
          <div className="scrollable">
            {items.map((item, key) => (
              <div className="history-widget-row" key={key}>
                <div className={item.action === "buy" ? "text-success" : "text-danger"}>
                  {(item.price / item.amount).toFixed(5)}
                </div>
                <div>{item.amount}</div>
                <div>{getDate(item.date)}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
};
