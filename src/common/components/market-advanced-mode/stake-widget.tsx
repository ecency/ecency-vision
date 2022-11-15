import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React, { useEffect, useState } from "react";
import { _t } from "../../i18n";
import { OrdersData, OrdersDataItem } from "../../api/hive";
import { MarketAsset } from "../market-swap-form/market-pair";
import formattedNumber from "../../util/formatted-number";

interface Props {
  history: OrdersData | null;
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
}

interface StakeItem {
  price: number;
  amount: number;
  total: number;
}

export const StakeWidget = ({ history, fromAsset, toAsset }: Props) => {
  const [sells, setSells] = useState<StakeItem[]>([]);
  const [maxSell, setMaxSell] = useState(0);
  const [buys, setBuys] = useState<StakeItem[]>([]);
  const [maxBuy, setMaxBuy] = useState(0);
  const [fraction, setFraction] = useState(0.00001);

  const rowsCount = 17;

  useEffect(() => {
    if (!history) return;

    const sells = buildStakeItems(history.asks, "desc");
    setSells(sells.slice(sells.length - 1 - rowsCount, sells.length));
    setMaxSell(
      Math.max(...sells.slice(sells.length - 1 - rowsCount, sells.length).map((i) => i.amount))
    );

    const buys = buildStakeItems(history.bids, "desc");
    setBuys(buys.slice(0, rowsCount));
    setMaxBuy(Math.max(...buys.slice(0, rowsCount).map((i) => i.amount)));
  }, [history]);

  const buildStakeItems = (h: OrdersDataItem[], sort: "asc" | "desc"): StakeItem[] =>
    Array.from(
      h
        // Group order items by fractions
        .reduce<Map<number, OrdersDataItem[]>>((acc, item) => {
          const price = item.hbd / 1000 / (item.hive / 1000);
          const priceWithFraction = getPriceWithFraction(price, fraction);
          if (acc.has(priceWithFraction)) {
            const values = acc.get(priceWithFraction)!;
            values.push(item);
            acc.set(priceWithFraction, values);
          } else {
            acc.set(priceWithFraction, [item]);
          }
          return acc;
        }, new Map())
        .entries()
    )
      .map(([price, items]) => ({
        // Calculate total amount inside one group
        amount: items.reduce((acc, item) => acc + item.hive / 1000, 0),
        price: price,
        // Calculate total funds inside one group
        total: items.reduce((acc, item) => acc + (item.hbd / 1000) * (item.hive / 1000), 0)
      }))
      .sort((a, b) => (sort === "desc" ? b.price - a.price : a.price - b.price));

  const getPriceWithFraction = (price: number, fraction: number): number => {
    if (fraction === 0.00001) return +price.toFixed(5);
    if (fraction === 0.0001) return +price.toFixed(4);
    if (fraction === 0.001) return +price.toFixed(3);
    if (fraction === 0.01) return +price.toFixed(2);
    if (fraction === 0.1) return +price.toFixed(1);
    return +price.toFixed(0);
  };

  return (
    <MarketAdvancedModeWidget
      title={_t("market.advanced.stake")}
      children={
        <div className="market-stake-widget">
          <div className="market-stake-widget-sell">
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
              <div>
                {sells.map((sell, key) => (
                  <div className="history-widget-row sell" key={key}>
                    <div
                      className="progress"
                      style={{ width: (sell.amount / maxSell) * 100 + "%" }}
                    />
                    <div className="text-danger">{sell.price}</div>
                    <div>{sell.amount.toFixed(2)}</div>
                    <div>{formattedNumber(sell.total, { fractionDigits: 2 })}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="market-stake-widget-buy">
            <div className="history-widget-content">
              <div>
                {buys.map((buy, key) => (
                  <div className="history-widget-row buy" key={key}>
                    <div
                      className="progress"
                      style={{ width: (buy.amount / maxBuy) * 100 + "%" }}
                    />
                    <div className="text-success">{buy.price}</div>
                    <div>{buy.amount.toFixed(2)}</div>
                    <div>{formattedNumber(buy.total, { fractionDigits: 2 })}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};
