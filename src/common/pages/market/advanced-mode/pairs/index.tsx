import React from "react";
import { MarketAsset } from "../../../../components/market-swap-form/market-pair";
import { HiveHbdObserver } from "./hive-hbd-observer";
import { DayChange } from "../types/day-change.type";

interface Props {
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  onDayChange: (dayChange: DayChange) => void;
}

export const MarketObserver = ({ fromAsset, toAsset, onDayChange }: Props) => {
  const hiveHbdPair = [MarketAsset.HBD, MarketAsset.HIVE];

  return (
    <>
      {hiveHbdPair.includes(fromAsset) && hiveHbdPair.includes(toAsset) ? (
        <HiveHbdObserver onDayChange={onDayChange} />
      ) : (
        <></>
      )}
    </>
  );
};
