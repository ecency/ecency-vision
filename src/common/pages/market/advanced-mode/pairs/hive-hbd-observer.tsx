import React, { useEffect } from "react";
import { getMarketStatistics, getOrderBook, OrdersData } from "../../../../api/hive";
import { DayChange } from "../types/day-change.type";
import { getCGMarket } from "../../../../components/market-swap-form/api/coingecko-api";
import { MarketAsset } from "../../../../components/market-swap-form/market-pair";
import { useInterval } from "react-use";

interface Props {
  onDayChange: (dayChange: DayChange) => void;
  onHistoryChange: (history: OrdersData) => void;
  onUsdChange: (usdPrice: number) => void;
}

export const HiveHbdObserver = ({ onDayChange, onHistoryChange, onUsdChange }: Props) => {
  useInterval(() => fetchAllStats(), 3600);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    fetchStats();
    fetchHistory();

    const usdResponse = await getCGMarket(MarketAsset.HIVE, MarketAsset.HBD);
    if (usdResponse[0]) {
      onUsdChange(usdResponse[0]);
    }
  };

  const fetchHistory = async () => {
    try {
      const history = await getOrderBook(100);
      onHistoryChange(history);
    } catch (e) {}
  };

  const fetchStats = async () => {
    try {
      const stats = await getMarketStatistics();
      onDayChange({
        price: +stats.latest,
        high: +stats.highest_bid,
        low: +stats.lowest_ask,
        percent: +stats.percent_change,
        totalFromAsset: stats.hive_volume.split(" ")[0],
        totalToAsset: stats.hbd_volume.split(" ")[0]
      });
    } catch (e) {}
  };

  return <></>;
};
