import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getMarketHistory, getMarketStatistics } from "@/api/hive";
import moment from "moment/moment";

export const getHiveHbdStatsQuery = () =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.HIVE_HBD_STATS],
    queryFn: async () => {
      const stats = await getMarketStatistics();
      const dayChange = await getMarketHistory(
        86400,
        moment().subtract(1, "days").toDate(),
        new Date()
      );
      return {
        price: +stats.latest,
        close: dayChange[0] ? dayChange[0].non_hive.open / dayChange[0].hive.open : 0,
        high: dayChange[0] ? dayChange[0].non_hive.high / dayChange[0].hive.high : 0,
        low: dayChange[0] ? dayChange[0].non_hive.low / dayChange[0].hive.low : 0,
        percent: dayChange[0]
          ? 100 - ((dayChange[0].non_hive.open / dayChange[0].hive.open) * 100) / +stats.latest
          : 0,
        totalFromAsset: stats.hive_volume.split(" ")[0],
        totalToAsset: stats.hbd_volume.split(" ")[0]
      } as const;
    }
  });
