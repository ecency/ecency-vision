import { DayChange } from "../types/day-change.type";
import { MarketAsset } from "../../../../components/market-swap-form/market-pair";

export const DAY_CHANGE_DEFAULT: DayChange = {
  totalFromAsset: MarketAsset.HIVE,
  totalToAsset: MarketAsset.HBD,
  price: 0,
  percent: 0,
  high: 0,
  low: 0
};
