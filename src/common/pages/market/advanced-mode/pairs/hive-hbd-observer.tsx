import React, { useEffect } from "react";
import { getMarketStatistics, getOrderBook, OrdersData } from "../../../../api/hive";
import { DayChange } from "../types/day-change.type";

interface Props {
  onDayChange: (dayChange: DayChange) => void;
  onHistoryChange: (history: OrdersData) => void;
}

export const HiveHbdObserver = ({ onDayChange, onHistoryChange }: Props) => {
  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, []);

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
