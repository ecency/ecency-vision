import React from "react";
import { MarketAsset } from "../../../components/market-swap-form/market-pair";
import { DayChange } from "./types/day-change.type";

interface Props {
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  price: number;
  usdPrice: number;
  dayChange: DayChange;
}

export const AdvancedModeToolbar = ({ fromAsset, toAsset, dayChange, usdPrice, price }: Props) => {
  const getPercent = () => {
    if (dayChange.percent > 0) {
      return `+${dayChange.percent}`;
    } else if (dayChange.percent < 0) {
      return `-${dayChange.percent}`;
    }
    return dayChange.percent;
  };

  return (
    <div className="advanced-mode-toolbar d-flex border-bottom border-top px-3 py-2">
      <div className="trading-pair pr-3 py-2">
        <b>
          {fromAsset}/{toAsset}
        </b>
      </div>
      <div className="pair-info d-flex border-left px-3">
        <div className="price">
          <div className="amount text-success">{price}</div>
          <div className="usd-value">${usdPrice}</div>
        </div>
        <div className="day-change-price change-price px-3">
          <label>24h change</label>
          <div>
            {dayChange.price} {getPercent()}%
          </div>
        </div>
        <div className="day-high-price change-price px-3">
          <label>24h high</label>
          <div>{dayChange.high}</div>
        </div>
        <div className="day-low-price change-price px-3">
          <label>24h low</label>
          <div>{dayChange.low}</div>
        </div>
        <div className="day-1-total change-price px-3">
          <label>24h volume(${fromAsset})</label>
          <div>{dayChange.totalFromAsset}</div>
        </div>
        <div className="day-2-total change-price px-3">
          <label>24h volume(${toAsset})</label>
          <div>{dayChange.totalToAsset}</div>
        </div>
      </div>
    </div>
  );
};
