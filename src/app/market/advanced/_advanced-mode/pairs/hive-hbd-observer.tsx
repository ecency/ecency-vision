import React, { useEffect } from "react";
import moment from "moment";
import { DayChange } from "@/app/market/advanced/_advanced-mode/types/day-change.type";
import { OpenOrdersData, OrdersData, Transaction } from "@/entities";
import useInterval from "react-use/lib/useInterval";
import { getCGMarket } from "@/api/coingecko-api";
import { getMarketHistory, getMarketStatistics, getOpenOrder, getOrderBook } from "@/api/hive";
import { MarketAsset } from "@/features/market/market-swap-form/market-pair";
import { useGlobalStore } from "@/core/global-store";
import { getTransactionsQuery } from "@/api/queries";

interface Props {
  onDayChange: (dayChange: DayChange) => void;
  onHistoryChange: (history: OrdersData) => void;
  onUsdChange: (usdPrice: number) => void;
  refresh: boolean;
  setRefresh: (v: boolean) => void;
  setOpenOrders: (data: OpenOrdersData[]) => void;
  setOpenOrdersDataLoading: (value: boolean) => void;
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
  setOpenOrdersDataLoading,
  setAllOrders,
  updateRate
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { data: transactions, refetch } = getTransactionsQuery(
    activeUser?.username,
    50,
    "market-orders"
  ).useClientQuery();

  useEffect(() => {
    setAllOrders(
      transactions?.pages?.[0].filter((item) => item.type === "limit_order_create") ?? []
    );
  }, [setAllOrders, transactions]);

  useInterval(() => fetchAllStats(), updateRate);

  useEffect(() => {
    fetchAllStats();
  }, []);

  useEffect(() => {
    fetchAllStats();
    setRefresh(false);
  }, [refresh]);

  const fetchAllStats = async () => {
    fetchStats();
    fetchHistory();
    fetchOpenOrders();
    refetch();

    const usdResponse = await getCGMarket(MarketAsset.HIVE, MarketAsset.HBD);
    if (usdResponse[0]) {
      onUsdChange(usdResponse[0]);
    }
  };

  const fetchOpenOrders = async () => {
    if (activeUser) {
      setOpenOrdersDataLoading(true);
      const res = await getOpenOrder(activeUser.username);
      setOpenOrders(res);
      setOpenOrdersDataLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const history = await getOrderBook(100);
      onHistoryChange(history);
    } catch (e) {}
  };

  const fetchStats = async () => {
    try {
      const stats = await getMarketStatistics();
      const dayChange = await getMarketHistory(
        86400,
        moment().subtract(1, "days").toDate(),
        new Date()
      );
      onDayChange({
        price: +stats.latest,
        close: dayChange[0] ? dayChange[0].non_hive.open / dayChange[0].hive.open : 0,
        high: dayChange[0] ? dayChange[0].non_hive.high / dayChange[0].hive.high : 0,
        low: dayChange[0] ? dayChange[0].non_hive.low / dayChange[0].hive.low : 0,
        percent: dayChange[0]
          ? 100 - ((dayChange[0].non_hive.open / dayChange[0].hive.open) * 100) / +stats.latest
          : 0,
        totalFromAsset: stats.hive_volume.split(" ")[0],
        totalToAsset: stats.hbd_volume.split(" ")[0]
      });
    } catch (e) {}
  };

  return <></>;
};
