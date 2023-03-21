import "use-indexeddb";
import setupIndexedDB, { useIndexedDBStore } from "use-indexeddb";
import { useEffect } from "react";
import { IndexedDBConfig } from "use-indexeddb/dist/interfaces";
import { getMarketHistory, MarketCandlestickDataItem } from "../../../api/hive";
import moment, { Moment } from "moment";

interface MarketCandlestickDataRecord extends MarketCandlestickDataItem {
  openDate: Moment;
}

interface MarketDataRecord {
  date: string;
  data: string;
  seconds: number;
}

const MARKET_DB_CONFIG: IndexedDBConfig = {
  databaseName: "ecency",
  version: 1,
  stores: [
    {
      name: "tv_hbd_hive",
      id: { keyPath: "id", autoIncrement: true },
      indices: [
        { name: "date", keyPath: "date" },
        { name: "data", keyPath: "data" },
        { name: "seconds", keyPath: "seconds" }
      ]
    }
  ]
};

/**
 *
 * @param ttl Time to live (hours)
 * @param version DB version
 */
export function useTradingViewCache(ttl: number | "none" = "none", version: number = 1) {
  const { add, update, getOneByKey, getManyByKey } =
    useIndexedDBStore<MarketDataRecord>("tv_hbd_hive");

  useEffect(() => {
    setupIndexedDB({
      ...MARKET_DB_CONFIG,
      version
    })
      .then(() => console.debug("Market caches started!"))
      .catch(() => console.error("Failed to start market caches."));
  }, []);

  /**
   * Get cached records from DB based on params
   * @param seconds
   * @param startDate
   * @param endDate
   */
  const getCached = async (seconds: number, startDate?: Moment, endDate?: Moment) => {
    // Fetch all records of current bucket
    const items = await getManyByKey("seconds", seconds);

    // Parse candlestick data
    let candlestickRecords = items
      .map((item) => JSON.parse(item.data) as MarketCandlestickDataRecord)
      .map((item) => ({
        ...item,
        openDate: moment(item.open)
      }));
    candlestickRecords = candlestickRecords
      .sort((a, b) => (a.openDate.isBefore(b.openDate) ? -1 : 1))
      // Filter all records for current time period
      .filter((item) =>
        !startDate || !endDate
          ? true
          : startDate.isSameOrBefore(item.openDate) && endDate.isSameOrAfter(item.openDate)
      );

    return candlestickRecords;
  };

  const cache = async (response: MarketCandlestickDataItem[], seconds: number) => {
    for (const item of response) {
      const existingItem = await getOneByKey("date", item.open);

      if (existingItem) {
        await update({
          date: item.open,
          data: JSON.stringify(item),
          seconds
        });
      } else {
        await add({
          date: item.open,
          data: JSON.stringify(item),
          seconds
        });
      }
    }
  };

  const getCachedMarketHistory = async (
    seconds: number,
    startDate: Moment,
    endDate: Moment
  ): Promise<MarketCandlestickDataItem[]> => {
    const cached = await getCached(seconds, startDate, endDate);
    if (cached.length > 0) {
      return cached;
      // const isLookingForPast = endDate.isBefore(moment());
      // const isFullCached = cached[0].openDate.isSame(startDate);
      // if (isLookingForPast) {
      //   if (isFullCached) {
      //     return cached;
      //   } else {
      //     const newPeriod = [startDate, cached[0].openDate];
      //     const newRecordsResponse = await getMarketHistory(seconds, newPeriod[0], newPeriod[1]);
      //     await cache(newRecordsResponse, seconds);
      //     return [...newRecordsResponse, ...cached];
      //   }
      // }
    }

    const response = await getMarketHistory(seconds, startDate, endDate);
    await cache(response, seconds);
    return response;
  };

  return {
    getCachedMarketHistory
  };
}
