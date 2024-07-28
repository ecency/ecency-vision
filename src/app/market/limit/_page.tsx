"use client";

import React, { useEffect, useState } from "react";
import { FullAccount, MarketStatistics, OpenOrdersData, OrdersData } from "@/entities";
import { getMarketStatistics, getOpenOrder, getOrderBook, getTradeHistory } from "@/api/hive";
import { ButtonGroup } from "@/features/ui";
import { useGlobalStore } from "@/core/global-store";
import { Feedback, Navbar, Skeleton } from "@/features/shared";
import i18next from "i18next";
import { HiveBarter } from "@/app/market/_components/hive-barter";
import { ChartStats } from "@/app/market/limit/_components/chart-stats";
import MarketChart from "@/app/market/limit/_components/market-chart";
import { OpenOrders } from "@/app/market/_components/open-orders";
import { Orders } from "@/app/market/limit/_components/orders";
import { MarketMode } from "@/app/market/_enums/market-mode";
import { Tsx } from "@/features/i18n/helper";
import { ModeSelector } from "@/app/market/_components/mode-selector";
import { useRouter } from "next/navigation";
import "../index.scss";

export function MarketLimitPage() {
  const router = useRouter();
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [data, setData] = useState<MarketStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [bidValues, setBidValues] = useState<any>({ lowest: 0, highest: 0, total: 0, amount: 0 });
  const [openOrdersdata, setopenOrdersdata] = useState<OpenOrdersData[]>([]);
  const [openOrdersDataLoading, setopenOrdersDataLoading] = useState(false);
  const [tablesData, setTablesData] = useState<OrdersData | null>(null);
  const [loadingTablesData, setLoadingTablesData] = useState(false);
  const [dataLoadedFirstTime, setDataLoadedFirstTime] = useState(false);
  const [exchangeType, setExchangeType] = useState(1);

  useEffect(() => {
    setLoading(true);
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

  return (
    <>
      <Feedback />
      <div className={"flex justify-center market-page " + MarketMode.LIMIT}>
        <div className="sm:w-[75%] p-3 sm:p-0">
          <div style={{ marginBottom: "6rem" }}>
            <Navbar />
          </div>
          <div className="mb-5 flex flex-col gap-3 text-center">
            <h2 className="text-3xl font-bold">{i18next.t("market.title")}</h2>
            <Tsx k="market.description">
              <div className="header-description" />
            </Tsx>
          </div>
          <ModeSelector
            className="mb-5 mx-auto equal-widths max-w-[600px]"
            mode={MarketMode.LIMIT}
            onSelect={(mode) => {
              switch (mode) {
                case MarketMode.ADVANCED:
                  router.push("/market/advanced");
                  break;
                case MarketMode.SWAP:
                  router.push("/market/swap");
                  break;
                default:
                  break;
              }
            }}
          />
          <div className="flex justify-content-md-between flex-col">
            <div className="mb-5">
              <div className="text-2xl mb-3">
                {loading ? (
                  <Skeleton className="skeleton-loading" />
                ) : (
                  i18next.t("market.stock-info")
                )}
              </div>
              <ChartStats data={data} loading={loading} />
            </div>

            {data && tablesData ? (
              <MarketChart bids={tablesData!.bids || []} asks={tablesData!.asks || []} />
            ) : (
              i18next.t("g.loading") + "..."
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
                        available={
                          (activeUser && (activeUser.data as FullAccount).hbd_balance) || ""
                        }
                        prefilledTotal={bidValues.total}
                        prefilledAmount={bidValues.amount}
                        peakValue={parseFloat(bidValues.lowest)}
                        basePeakValue={data ? parseFloat(data!.lowest_ask) : 0}
                        loading={loading}
                        username={activeUser!.username}
                        onTransactionSuccess={updateOpenData}
                        onClickPeakValue={(value: any) =>
                          setBidValues({ ...bidValues, lowest: value })
                        }
                      />
                    </div>
                    <div className="col-span-12 sm:col-start-8 sm:col-span-5 p-0">
                      <HiveBarter
                        type={2}
                        prefilledTotal={bidValues.total}
                        prefilledAmount={bidValues.amount}
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
                      <div className="text-2xl">{i18next.t("market.barter")}</div>
                      <ButtonGroup
                        className="my-3"
                        labels={[i18next.t("market.buy"), i18next.t("market.sell")]}
                        selected={exchangeType === 1 ? 0 : 1}
                        setSelected={(v) => setExchangeType(v + 1)}
                      />
                    </div>

                    {exchangeType === 1 ? (
                      <HiveBarter
                        type={1}
                        available={
                          (activeUser && (activeUser.data as FullAccount).hbd_balance) || ""
                        }
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
                      />
                    </div>
                  )}
                  <div className="col-span-12 xl:col-span-5 px-0">
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
                  <div className="col-span-12 xl:col-start-8 xl:col-span-5 px-0 sm:px-[auto] mt-5 lg:mt-0">
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
        </div>
      </div>
    </>
  );
}
