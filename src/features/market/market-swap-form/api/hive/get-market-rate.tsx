import { MarketAsset } from "../../market-pair";
import { getMarketStatistics } from "@/api/hive";

export const getHiveMarketRate = async (asset: MarketAsset): Promise<number> => {
  if (asset === MarketAsset.HIVE) {
    const market = await getMarketStatistics();
    return +market.lowest_ask;
  } else if (asset === MarketAsset.HBD) {
    const market = await getMarketStatistics();
    return 1 / +market.lowest_ask;
  }
  return 0;
};
