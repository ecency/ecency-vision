import React from "react";
import { MarketAsset } from "../../../../components/market-swap-form/market-pair";
import { HiveHbdObserver } from "./hive-hbd-observer";
import { DayChange } from "../types/day-change.type";
import { OpenOrdersData, OrdersData } from "../../../../api/hive";
import { ActiveUser } from "../../../../store/active-user/types";

interface Props {
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  onDayChange: (dayChange: DayChange) => void;
  onHistoryChange: (history: OrdersData) => void;
  onUsdChange: (usdPrice: number) => void;
  refresh: boolean;
  setRefresh: (v: boolean) => void;
  activeUser: ActiveUser | null;
  setOpenOrders: (data: OpenOrdersData[]) => void;
  setOpenOrdersDataLoading: (value: boolean) => void;
}

export const MarketObserver = ({
  fromAsset,
  toAsset,
  onDayChange,
  onHistoryChange,
  onUsdChange,
  refresh,
  setRefresh,
  activeUser,
  setOpenOrders,
  setOpenOrdersDataLoading
}: Props) => {
  const hiveHbdPair = [MarketAsset.HBD, MarketAsset.HIVE];

  return (
    <>
      {hiveHbdPair.includes(fromAsset) && hiveHbdPair.includes(toAsset) ? (
        <HiveHbdObserver
          refresh={refresh}
          setRefresh={setRefresh}
          onDayChange={onDayChange}
          onHistoryChange={onHistoryChange}
          onUsdChange={onUsdChange}
          activeUser={activeUser}
          setOpenOrders={setOpenOrders}
          setOpenOrdersDataLoading={setOpenOrdersDataLoading}
        />
      ) : (
        <></>
      )}
    </>
  );
};
