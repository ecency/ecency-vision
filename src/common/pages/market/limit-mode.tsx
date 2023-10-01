import { PageProps } from "../common";
import React, { useEffect, useState } from "react";
import {
  getMarketStatistics,
  getOpenOrder,
  getOrderBook,
  getTradeHistory,
  MarketStatistics,
  OpenOrdersData,
  OrdersData
} from "../../api/hive";
import { _t } from "../../i18n";
import { Skeleton } from "../../components/skeleton";
import { ChartStats } from "../../components/chart-stats";
import SSRSuspense from "../../components/ssr-suspense";
import { HiveBarter } from "../../components/hive-barter";
import { FullAccount } from "../../store/accounts/types";
import { OpenOrders } from "../../components/open-orders";
import { Orders } from "../../components/orders";
import { ButtonGroup } from "@ui/button-group";

const MarketChart = React.lazy(() => import("../../components/market-chart"));

export const LimitMarketMode = (props: PageProps) => {
  const [data, setData] = useState<MarketStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bidValues, setBidValues] = useState<any>({ lowest: 0, highest: 0, total: 0, amount: 0 });
  const [openOrdersdata, setopenOrdersdata] = useState<OpenOrdersData[]>([]);
  const [openOrdersDataLoading, setopenOrdersDataLoading] = useState(false);
  const [tablesData, setTablesData] = useState<OrdersData | null>(null);
  const [loadingTablesData, setLoadingTablesData] = useState(false);
  const [dataLoadedFirstTime, setDataLoadedFirstTime] = useState(false);
  const [exchangeType, setExchangeType] = useState(1);
  const { global, activeUser } = props;

  useEffect(() => {
    setLoading(true);
    setMounted(true);
    setLoadingTablesData(true);
    setopenOrdersDataLoading(true);
    updateData();
    setInterval(() => updateData(), 20000);
  }, []);

  useEffect(() => {
    !dataLoadedFirstTime &&
      data &&
      setBidValues({
        lowest: parseFloat(data!.lowest_ask),
        highest: parseFloat(data!.highest_bid)
      });
    if (!dataLoadedFirstTime && data) {
      setDataLoadedFirstTime(true);
    }
  }, [data]);

  const updateData = () => {
    getMarketStatistics().then((res) => {
      setLoading(false);
      setData(res);
    });
    getOrderBook().then((res) => {
      getTradeHistory().then((trading) => {
        setLoadingTablesData(false);
        setTablesData({ ...res, trading });
      });
    });
    activeUser &&
      getOpenOrder(activeUser.username).then((res) => {
        setopenOrdersdata(res);
        setopenOrdersDataLoading(false);
      });
  };

  const updateOpenData = () => {
    if (activeUser) {
      setopenOrdersDataLoading(true);
      getOpenOrder(activeUser.username).then((res) => {
        setopenOrdersdata(res);
        setopenOrdersDataLoading(false);
      });
    }
  };

  return mounted ? (
    <>
      <div className="flex justify-content-md-between flex-col">
        <div className="mb-5">
          <h4 className="mb-3">
            {loading ? <Skeleton className="skeleton-loading" /> : _t("market.stock-info")}
          </h4>
          <ChartStats data={data} loading={loading} />
        </div>

        {data && tablesData ? (
          <SSRSuspense fallback={<div>{_t("g.loading-chunk")}...</div>}>
            <MarketChart
              bids={tablesData!.bids || []}
              asks={tablesData!.asks || []}
              theme={global.theme}
            />
          </SSRSuspense>
        ) : (
          _t("g.loading") + "..."
        )}
      </div>
      <div className="flex justify-center">
        <div className="container my-5 mx-0">
          <div>
            {activeUser && (
              <div className="grid-cols-12 justify-between hidden md:grid px-3">
                <div className="col-span-12 sm:col-span-5 p-0">
                  <HiveBarter
                    type={1}
                    available={(activeUser && (activeUser.data as FullAccount).hbd_balance) || ""}
                    prefilledTotal={bidValues.total}
                    prefilledAmount={bidValues.amount}
                    peakValue={parseFloat(bidValues.lowest)}
                    basePeakValue={data ? parseFloat(data!.lowest_ask) : 0}
                    loading={loading}
                    username={activeUser!.username}
                    activeUser={activeUser}
                    global={global}
                    onTransactionSuccess={updateOpenData}
                    onClickPeakValue={(value: any) => setBidValues({ ...bidValues, lowest: value })}
                  />
                </div>
                <div className="col-span-12 sm:col-5 p-0">
                  <HiveBarter
                    type={2}
                    prefilledTotal={bidValues.total}
                    prefilledAmount={bidValues.amount}
                    activeUser={activeUser}
                    global={global}
                    available={(activeUser && (activeUser.data as FullAccount).balance) || ""}
                    peakValue={parseFloat(bidValues.highest)}
                    basePeakValue={data ? parseFloat(data!.highest_bid) : 0}
                    loading={loading}
                    username={activeUser!.username}
                    onTransactionSuccess={updateOpenData}
                    onClickPeakValue={(value: any) =>
                      setBidValues({ ...bidValues, highest: value })
                    }
                  />
                </div>
              </div>
            )}

            {activeUser && (
              <div className="flex flex-col md:hidden">
                <div className="flex sm:items-center justify-start sm:justify-between flex-col sm:flex-row">
                  <h3>{_t("market.barter")}</h3>
                  <ButtonGroup
                    className="my-3"
                    labels={[_t("market.buy"), _t("market.sell")]}
                    selected={exchangeType === 1 ? 0 : 1}
                    setSelected={(v) => setExchangeType(v + 1)}
                  />
                </div>

                {exchangeType === 1 ? (
                  <HiveBarter
                    activeUser={activeUser}
                    global={global}
                    type={1}
                    available={(activeUser && (activeUser.data as FullAccount).hbd_balance) || ""}
                    peakValue={parseFloat(bidValues.lowest)}
                    basePeakValue={data ? parseFloat(data!.lowest_ask) : 0}
                    loading={loading}
                    username={activeUser!.username}
                    onTransactionSuccess={updateOpenData}
                    onClickPeakValue={() =>
                      setBidValues({
                        ...bidValues,
                        lowest: data ? parseFloat(data!.lowest_ask) : 0
                      })
                    }
                  />
                ) : (
                  <HiveBarter
                    activeUser={activeUser}
                    global={global}
                    type={2}
                    available={(activeUser && (activeUser.data as FullAccount).balance) || ""}
                    peakValue={parseFloat(bidValues.highest)}
                    basePeakValue={data ? parseFloat(data!.highest_bid) : 0}
                    loading={loading}
                    onTransactionSuccess={updateOpenData}
                    username={activeUser!.username}
                    onClickPeakValue={() =>
                      setBidValues({
                        ...bidValues,
                        highest: data ? parseFloat(data!.highest_bid) : 0
                      })
                    }
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-12 mt-5 mx-0 justify-between">
              {!openOrdersDataLoading && openOrdersdata.length > 0 && activeUser && (
                <div className="col-span-12 px-0 mb-5">
                  <OpenOrders
                    onTransactionSuccess={updateOpenData}
                    data={openOrdersdata || []}
                    loading={openOrdersDataLoading}
                    username={(activeUser && activeUser.username) || ""}
                    activeUser={activeUser}
                  />
                </div>
              )}
              <div className="col-span-12 xl:col-5 px-0">
                <Orders
                  onPriceClick={(value) =>
                    setBidValues({
                      highest: value.key1,
                      lowest: value.key1,
                      total: value.key3,
                      amount: value.key2
                    })
                  }
                  type={1}
                  loading={loadingTablesData}
                  data={tablesData ? tablesData!.bids : []}
                />
              </div>
              <div className="col-span-12 xl:col-span-5 px-0 sm:px-[auto] mt-5 lg:mt-0">
                <Orders
                  onPriceClick={(value) =>
                    setBidValues({
                      lowest: value.key1,
                      highest: value.key1,
                      total: value.key3,
                      amount: value.key2
                    })
                  }
                  type={2}
                  loading={loadingTablesData}
                  data={tablesData ? tablesData!.asks : []}
                />
              </div>
              <div className="col-span-12 px-0 sm:px-[auto] mt-5">
                <Orders
                  type={3}
                  loading={loadingTablesData}
                  data={tablesData ? tablesData!.trading : []}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
};
