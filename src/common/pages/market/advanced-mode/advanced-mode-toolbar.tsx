import React from "react";
import { MarketAsset } from "../../../components/market-swap-form/market-pair";
import { DayChange } from "./types/day-change.type";
import formattedNumber from "../../../util/formatted-number";
import * as ls from "../../../util/local-storage";
import { MARKET_MODE_LS_TOKEN, MarketMode } from "../market-mode";
import { ModeSelector } from "../mode-selector";
import { AdvancedModeSettings } from "./advanced-mode-settings";
import { Global } from "../../../store/global/types";

interface Props {
  global: Global;
  mode: MarketMode;
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  price: number;
  usdPrice: number;
  dayChange: DayChange;
  setMode: (mode: MarketMode) => void;
  updateRate: number;
  setUpdateRate: (value: number) => void;
}

export const AdvancedModeToolbar = ({
  mode,
  fromAsset,
  toAsset,
  dayChange,
  usdPrice,
  price,
  setMode,
  updateRate,
  setUpdateRate,
  global
}: Props) => {
  const getPercent = () => {
    if (dayChange.percent > 0) {
      return `+${dayChange.percent.toFixed(2)}`;
    }
    return dayChange.percent.toFixed(2);
  };

  return (
    <div className="advanced-mode-toolbar flex border-b border-t border-[--border-color] px-3">
      <div className="trading-pair py-3 pl-2 pr-4 border-r border-[--border-color]">
        <b>
          {fromAsset}/{toAsset}
        </b>
      </div>
      {global.isMobile ? (
        <></>
      ) : (
        <div className="pair-info px-3 flex-1">
          <div className="price">
            <div className={"amount " + (dayChange.percent > 0 ? "text-green" : "text-red")}>
              {formattedNumber(dayChange.price)}
            </div>
            <div className="usd-value">${usdPrice.toFixed(2)}</div>
          </div>
          <div className="day-change-price change-price">
            <label>24h change</label>
            <div className={dayChange.percent > 0 ? "text-green" : "text-red"}>{getPercent()}%</div>
          </div>
          <div className="day-high-price change-price">
            <label>24h high</label>
            <div>{formattedNumber(dayChange.high)}</div>
          </div>
          <div className="day-low-price change-price">
            <label>24h low</label>
            <div>{formattedNumber(dayChange.low)}</div>
          </div>
          <div className="day-1-total change-price">
            <label>24h volume({fromAsset})</label>
            <div>{formattedNumber(dayChange.totalFromAsset)}</div>
          </div>
          <div className="day-2-total change-price">
            <label>24h volume({toAsset})</label>
            <div>{formattedNumber(dayChange.totalToAsset)}</div>
          </div>
        </div>
      )}
      <div className="flex items-center">
        <AdvancedModeSettings updateRate={updateRate} setUpdateRate={setUpdateRate} />
        <ModeSelector
          className="py-1 my-2"
          mode={mode}
          onSelect={(mode) => {
            setMode(mode);
            ls.set(MARKET_MODE_LS_TOKEN, mode);
          }}
        />
      </div>
    </div>
  );
};
