import React, { useCallback, useEffect } from "react";
import { DayChange } from "@/app/market/advanced/_advanced-mode/types/day-change.type";
import { OpenOrdersData, OrdersData, Transaction } from "@/entities";
import useInterval from "react-use/lib/useInterval";
import { getCGMarket } from "@/api/coingecko-api";
import { MarketAsset } from "@/features/market/market-swap-form/market-pair";
import { useGlobalStore } from "@/core/global-store";
import {
  getHiveHbdStatsQuery,
  getOpenOrdersQuery,
  getOrderBookQuery,
  getTransactionsQuery
} from "@/api/queries";
import useMount from "react-use/lib/useMount";

interface Props {
  onDayChange: (dayChange: DayChange) => void;
  onHistoryChange: (history: OrdersData) => void;
  onUsdChange: (usdPrice: number) => void;
  refresh: boolean;
  setRefresh: (v: boolean) => void;
  setOpenOrders: (data: OpenOrdersData[]) => void;
  setAllOrders: (value: Transaction[]) => void;
  updateRate: number;
}

export const HiveHbdObserver = ({
  onDayChange,
  onHistoryChange,
  onUsdChange,
  refresh,
  setRefresh,
  setOpenOrders,
  setAllOrders,
  updateRate
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { data: transactions, refetch: reFetchTransactions } = getTransactionsQuery(
    activeUser?.username,
    50,
    "market-orders"
  ).useClientQuery();
  const { data: allStats, refetch: reFetchAllStats } = getHiveHbdStatsQuery().useClientQuery();
  const { data: orderBook, refetch: reFetchOrderBook } = getOrderBookQuery(100).useClientQuery();
  const { data: openOrders, refetch: reFetchOpenOrders } = getOpenOrdersQuery(
    activeUser?.username ?? ""
  ).useClientQuery();

  const fetchAllStats = useCallback(async () => {
    reFetchAllStats();
    reFetchOrderBook();
    reFetchOpenOrders();
    reFetchTransactions();

    const usdResponse = await getCGMarket(MarketAsset.HIVE, MarketAsset.HBD);
    if (usdResponse[0]) {
      onUsdChange(usdResponse[0]);
    }
  }, [onUsdChange, reFetchAllStats, reFetchOpenOrders, reFetchOrderBook, reFetchTransactions]);

  useEffect(() => {
    setAllOrders(
      transactions?.pages?.[0]?.filter((item) => item.type === "limit_order_create") ?? []
    );
  }, [setAllOrders, transactions]);

  useInterval(() => fetchAllStats(), updateRate);

  useMount(() => {
    fetchAllStats();
  });

  useEffect(() => {
    if (allStats) {
      onDayChange(allStats);
    }
  }, [allStats, onDayChange]);

  useEffect(() => {
    if (orderBook) {
      onHistoryChange(orderBook);
    }
  }, [onHistoryChange, orderBook]);

  useEffect(() => {
    if (openOrders) {
      setOpenOrders(openOrders);
    }
  }, [openOrders, setOpenOrders]);

  useEffect(() => {
    fetchAllStats();
    setRefresh(false);
  }, [fetchAllStats, refresh, setRefresh]);

  return <></>;
};
