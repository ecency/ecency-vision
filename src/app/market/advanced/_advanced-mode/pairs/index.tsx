import React from "react";
import { HiveHbdObserver } from "./hive-hbd-observer";
import { DayChange } from "../types/day-change.type";
import { MarketAsset } from "@/features/market/market-swap-form/market-pair";
import { OpenOrdersData, OrdersData, Transaction } from "@/entities";

interface Props {
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  onDayChange: (dayChange: DayChange) => void;
  onHistoryChange: (history: OrdersData) => void;
  onUsdChange: (usdPrice: number) => void;
  refresh: boolean;
  setRefresh: (v: boolean) => void;
  setOpenOrders: (data: OpenOrdersData[]) => void;
  setAllOrders: (value: Transaction[]) => void;
  updateRate: number;
}

export const MarketObserver = ({
  fromAsset,
  toAsset,
  onDayChange,
  onHistoryChange,
  onUsdChange,
  refresh,
  setRefresh,
  setOpenOrders,
  setAllOrders,
  updateRate
}: Props) => {
  const hiveHbdPair = [MarketAsset.HBD, MarketAsset.HIVE];

  return (
    <>
      {hiveHbdPair.includes(fromAsset) && hiveHbdPair.includes(toAsset) ? (
        <HiveHbdObserver
          setAllOrders={setAllOrders}
          refresh={refresh}
          setRefresh={setRefresh}
          onDayChange={onDayChange}
          onHistoryChange={onHistoryChange}
          onUsdChange={onUsdChange}
          setOpenOrders={setOpenOrders}
          updateRate={updateRate}
        />
      ) : (
        <></>
      )}
    </>
  );
};
