export enum MarketAsset {
  HIVE = "HIVE",
  HBD = "HBD"
}

export const MarketPairs = {
  [MarketAsset.HBD]: [MarketAsset.HIVE, MarketAsset.HBD],
  [MarketAsset.HIVE]: [MarketAsset.HIVE, MarketAsset.HBD]
};
