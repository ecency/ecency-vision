import React, { useEffect } from "react";
import { getMarketStatistics } from "../../../../api/hive";
import { DayChange } from "../types/day-change.type";

interface Props {
  onDayChange: (dayChange: DayChange) => void;
}

export const HiveHbdObserver = ({ onDayChange }: Props) => {
  useEffect(() => {
    fetchStats();
  }, []);

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
