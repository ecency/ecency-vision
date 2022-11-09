import React from "react";
import { MarketAsset } from "../../../../components/market-swap-form/market-pair";
import { HiveHbdObserver } from "./hive-hbd-observer";

interface Props {
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
}

export const MarketObserver = ({ fromAsset, toAsset }: Props) => {
  const hiveHbdPair = [MarketAsset.HBD, MarketAsset.HIVE];

  return (
    <>
      {hiveHbdPair.includes(fromAsset) && hiveHbdPair.includes(toAsset) ? (
        <HiveHbdObserver />
      ) : (
        <></>
      )}
    </>
  );
};
