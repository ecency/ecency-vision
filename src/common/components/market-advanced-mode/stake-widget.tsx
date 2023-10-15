import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React, { useEffect, useState } from "react";
import { _t } from "../../i18n";
import { OrdersData, OrdersDataItem } from "../../api/hive";
import { MarketAsset } from "../market-swap-form/market-pair";
import formattedNumber from "../../util/formatted-number";
import { StakeWidgetHeaderOptions, StakeWidgetViewType } from "./stake-widget-header-options";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../util/local-storage";
import { Global } from "../../store/global/types";

interface Props {
  global: Global;
  price: number;
  usdPrice: number;
  browserHistory: History;
  history: OrdersData | null;
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  widgetTypeChanged: (type: Widget) => void;
  onPriceClick: (value: number) => void;
  onAmountClick: (value: number) => void;
}

interface StakeItem {
  price: number;
  amount: number;
  total: number;
}

export const StakeWidget = ({
  history,
  fromAsset,
  toAsset,
  browserHistory,
  widgetTypeChanged,
  onPriceClick,
  onAmountClick,
  price,
  usdPrice,
  global
}: Props) => {
  const [storedFraction, setStoredFraction] = useLocalStorage<number>(PREFIX + "_amml_st_fr");
  const [storedViewType, setStoredViewType] = useLocalStorage<StakeWidgetViewType>(
    PREFIX + "_amml_st_vt"
  );

  const [sells, setSells] = useState<StakeItem[]>([]);
  const [maxSell, setMaxSell] = useState(0);
  const [buys, setBuys] = useState<StakeItem[]>([]);
  const [maxBuy, setMaxBuy] = useState(0);
  const [fraction, setFraction] = useState(storedFraction ?? 0.00001);
  const [viewType, setViewType] = useState(storedViewType ?? StakeWidgetViewType.All);
  const [unlimited, setUnlimited] = useState(storedViewType !== StakeWidgetViewType.All ?? false);

  const rowsCount = global.isMobile ? 5 : 20;

  useEffect(() => {
    buildAllStakeItems(fraction, unlimited);
  }, [history]);

  const buildAllStakeItems = (fraction: number, unlimited?: boolean) => {
    if (!history) return;

    let sells = buildStakeItems(history.asks, "desc", fraction);
    sells = sells.slice(sells.length - 1 - (unlimited ? rowsCount * 1.5 : rowsCount), sells.length);
    setSells(sells);
    setMaxSell(Math.min(500, Math.max(...sells.map((i) => i.amount))));

    let buys = buildStakeItems(history.bids, "desc", fraction);
    buys = buys.slice(0, unlimited ? rowsCount * 1.5 : rowsCount);
    setBuys(buys);
    setMaxBuy(Math.min(500, Math.max(...buys.map((i) => i.amount))));
  };

  const buildStakeItems = (
    h: OrdersDataItem[],
    sort: "asc" | "desc",
    fraction: number
  ): StakeItem[] =>
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
        total: items.reduce((acc, item) => acc + item.hive / 1000, 0) * price
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
      history={browserHistory}
      type={Widget.Stake}
      className="market-advanced-mode-stake-widget"
      headerOptions={
        <StakeWidgetHeaderOptions
          fraction={fraction}
          onFractionChange={(value) => {
            setFraction(value);
            buildAllStakeItems(value);
            setStoredFraction(value);
          }}
          viewType={viewType}
          onViewTypeChange={(value) => {
            setViewType(value);
            setStoredViewType(value);
            setUnlimited(value !== StakeWidgetViewType.All);
            if (value !== viewType) buildAllStakeItems(fraction, value !== StakeWidgetViewType.All);
          }}
        />
      }
      children={
        <>
          <div className="market-stake-widget-content history-widget-content">
            <div className="history-widget-row history-widget-header">
              <div>
                {_t("market.advanced.history-widget.price")}({toAsset})
              </div>
              <div>
                {_t("market.advanced.history-widget.amount")}({fromAsset})
              </div>
              {global.isMobile ? <></> : <div>{_t("market.advanced.history-widget.volume")}</div>}
            </div>
          </div>
          <div
            className={
              "market-stake-widget " + (viewType !== StakeWidgetViewType.All ? "one-type" : "")
            }
          >
            <div className="market-stake-widget-sell">
              <div className="market-stake-widget-content history-widget-content">
                <div>
                  {[StakeWidgetViewType.All, StakeWidgetViewType.Sell].includes(viewType) &&
                    sells.map((sell, key) => (
                      <div className="history-widget-row selectable sell" key={key}>
                        <div
                          className="history-widget-row-progress"
                          style={{ width: (sell.amount / maxSell) * 100 + "%" }}
                        />
                        <div className="text-red price" onClick={() => onPriceClick(sell.price)}>
                          {sell.price}
                        </div>
                        <div className="amount" onClick={() => onAmountClick(sell.amount)}>
                          {sell.amount.toFixed(2)}
                        </div>
                        {global.isMobile ? (
                          <></>
                        ) : (
                          <div>{formattedNumber(sell.total, { fractionDigits: 2 })}</div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="market-stake-widget-current-price py-2">
              <span className="price">{price.toFixed(3)}</span>
              <span className="usd-price">${usdPrice.toFixed(3)}</span>
            </div>
            <div className="market-stake-widget-buy">
              <div className="market-stake-widget-sell pt-0 history-widget-content">
                <div>
                  {[StakeWidgetViewType.All, StakeWidgetViewType.Buy].includes(viewType) &&
                    buys.map((buy, key) => (
                      <div className="history-widget-row selectable buy" key={key}>
                        <div
                          className="history-widget-row-progress"
                          style={{ width: (buy.amount / maxBuy) * 100 + "%" }}
                        />
                        <div className="text-green price" onClick={() => onPriceClick(buy.price)}>
                          {buy.price}
                        </div>
                        <div className="amount" onClick={() => onAmountClick(buy.amount)}>
                          {buy.amount.toFixed(2)}
                        </div>
                        {global.isMobile ? (
                          <></>
                        ) : (
                          <div>{formattedNumber(buy.total, { fractionDigits: 2 })}</div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      }
      widgetTypeChanged={widgetTypeChanged}
    />
  );
};
