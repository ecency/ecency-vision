import { MarketAsset } from "../../../../components/market-swap-form/market-pair";

export interface DayChange {
  price: number;
  percent: number;
  high: number;
  low: number;
  totalFromAsset: MarketAsset;
  totalToAsset: MarketAsset;
}
