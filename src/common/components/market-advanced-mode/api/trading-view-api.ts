import { MarketCandlestickDataItem } from "../../../api/hive";
import moment from "moment/moment";
import { Time } from "lightweight-charts";
import { useState } from "react";
import { useTradingViewCache } from "../caching";
import { Moment } from "moment";

export function useTradingViewApi(setData: (value: MarketCandlestickDataItem[]) => void) {
  const { getCachedMarketHistory } = useTradingViewCache();

  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState<MarketCandlestickDataItem[]>([]);

  const fetchData = async (
    bucketSeconds: number,
    startDate: Moment,
    endDate: Moment,
    loadMore?: boolean
  ) => {
    setIsLoading(true);
    const apiData = await getCachedMarketHistory(bucketSeconds, startDate, endDate);
    let transformedData: MarketCandlestickDataItem[] = [];

    if (loadMore) {
      transformedData = [...originalData, ...apiData];
    } else {
      transformedData = apiData;
    }
    setOriginalData(transformedData);

    const dataMap = transformedData
      .map(({ hive, non_hive, open }) => ({
        close: non_hive.close / hive.close,
        open: non_hive.open / hive.open,
        low: non_hive.low / hive.low,
        high: non_hive.high / hive.high,
        volume: hive.volume,
        time: Math.floor(moment(open).toDate().getTime() / 1000) as Time
      }))
      .reduce((acc, item) => acc.set(item.time, item), new Map<Time, any>());
    setIsLoading(false);

    setData(Array.from(dataMap.values()).sort((a, b) => Number(a.time) - Number(b.time)));
  };

  return {
    fetchData
  };
}
