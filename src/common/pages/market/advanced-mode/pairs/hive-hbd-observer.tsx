import React, { useEffect } from "react";
import {
  getMarketStatistics,
  getOpenOrder,
  getOrderBook,
  OpenOrdersData,
  OrdersData
} from "../../../../api/hive";
import { DayChange } from "../types/day-change.type";
import { getCGMarket } from "../../../../components/market-swap-form/api/coingecko-api";
import { MarketAsset } from "../../../../components/market-swap-form/market-pair";
import { useInterval } from "react-use";
import { ActiveUser } from "../../../../store/active-user/types";
import { fetchTransactions } from "../../../../store/transactions/fetchTransactions";
import { Transaction } from "../../../../store/transactions/types";

interface Props {
  onDayChange: (dayChange: DayChange) => void;
  onHistoryChange: (history: OrdersData) => void;
  onUsdChange: (usdPrice: number) => void;
  refresh: boolean;
  setRefresh: (v: boolean) => void;
  activeUser: ActiveUser | null;
  setOpenOrders: (data: OpenOrdersData[]) => void;
  setOpenOrdersDataLoading: (value: boolean) => void;
  setAllOrders: (value: Transaction[]) => void;
}

export const HiveHbdObserver = ({
  activeUser,
  onDayChange,
  onHistoryChange,
  onUsdChange,
  refresh,
  setRefresh,
  setOpenOrders,
  setOpenOrdersDataLoading,
  setAllOrders
}: Props) => {
  useInterval(() => fetchAllStats(), 10000);

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
    fetchAllOrders();

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

  const fetchAllOrders = async () => {
    if (activeUser) {
      const history = await fetchTransactions(activeUser.username, "market-orders", -1, 50);
      setAllOrders(history.filter((item) => item.type === "limit_order_create"));
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
      onDayChange({
        price: +stats.latest,
        high: +stats.highest_bid,
        low: +stats.lowest_ask,
        percent: +stats.percent_change,
        totalFromAsset: stats.hive_volume.split(" ")[0],
        totalToAsset: stats.hbd_volume.split(" ")[0]
      });
    } catch (e) {}
  };

  return <></>;
};
