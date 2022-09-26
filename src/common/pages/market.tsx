import React, { useEffect, useState } from "react";
import { NavBar } from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import { connect } from "react-redux";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { ChartStats } from "../components/chart-stats";
import { HiveBarter } from "../components/hive-barter";
import {
  getMarketStatistics,
  getOpenOrder,
  getOrderBook,
  getTradeHistory,
  MarketStatistics,
  OpenOrdersData,
  OrdersData
} from "../api/hive";
import { FullAccount } from "../store/accounts/types";
import { Orders } from "../components/orders";
import { OpenOrders } from "../components/open-orders";
import SSRSuspense from "../components/ssr-suspense";
import { Skeleton } from "../components/skeleton";
import { _t } from "../i18n";
import { Button, ButtonGroup } from "react-bootstrap";
import { Tsx } from "../i18n/helper";
import Feedback from "../components/feedback";
import Meta from "../components/meta";

const MarketChart = React.lazy(() => import("../components/market-chart"));

const MarketPage = (props: PageProps) => {
  const [data, setData] = useState<MarketStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bidValues, setBidValues] = useState<any>({ lowest: 0, highest: 0 });
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

  let navbar = global.isElectron ? (
    NavBarElectron({
      ...props,
      reloadFn: () => {},
      reloading: false
    })
  ) : (
    <NavBar {...props} />
  );
  const metaProps = {
    title: _t("market.title"),
    description: _t("market.description")
  };

  return mounted ? (
    <>
      <Meta {...metaProps} />
      <Feedback activeUser={props.activeUser} />
      <div className="d-flex justify-content-center">
        <div className="w-sm-75 p-3 p-sm-0">
          <div style={{ marginBottom: "6rem" }}>{navbar}</div>
          <div className="mb-5">
            <h2>{_t("market.title")}</h2>
            <Tsx k="market.description">
              <div className="header-description" />
            </Tsx>
          </div>
          <div className="d-flex justify-content-md-between flex-column">
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
          <div className="d-flex justify-content-center">
            <div className="container my-5 mx-0">
              <div>
                {activeUser && (
                  <div className="row justify-content-between d-none d-md-flex px-3">
                    <div className="col-12 col-sm-5 p-0">
                      <HiveBarter
                        type={1}
                        available={
                          (activeUser && (activeUser.data as FullAccount).hbd_balance) || ""
                        }
                        peakValue={parseFloat(bidValues.lowest)}
                        basePeakValue={data ? parseFloat(data!.lowest_ask) : 0}
                        loading={loading}
                        username={activeUser!.username}
                        activeUser={activeUser}
                        global={global}
                        onTransactionSuccess={updateOpenData}
                        onClickPeakValue={(value: any) =>
                          setBidValues({ ...bidValues, lowest: value })
                        }
                      />
                    </div>
                    <div className="col-12 col-sm-5 p-0">
                      <HiveBarter
                        type={2}
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
                  <div className="d-flex flex-column d-md-none">
                    <div className="d-flex align-items-sm-center justify-content-start justify-content-sm-between flex-column flex-sm-row">
                      <h3>{_t("market.barter")}</h3>
                      <ButtonGroup size="lg" className="my-3">
                        <Button
                          className="rounded-right"
                          variant={exchangeType === 1 ? "primary" : "secondary"}
                          onClick={() => setExchangeType(1)}
                          style={{
                            borderTopRightRadius: "0px !important",
                            borderBottomRightRadius: "0px !important"
                          }}
                        >
                          {_t("market.buy")}
                        </Button>
                        <Button
                          variant={exchangeType === 2 ? "primary" : "secondary"}
                          className="rounded-left"
                          onClick={() => setExchangeType(2)}
                          style={{
                            borderTopLeftRadius: "0px !important",
                            borderBottomLeftRadius: "0px !important"
                          }}
                        >
                          {_t("market.sell")}
                        </Button>
                      </ButtonGroup>
                    </div>

                    {exchangeType === 1 ? (
                      <HiveBarter
                        activeUser={activeUser}
                        global={global}
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

                <div className="row mt-5 mx-0 justify-content-between">
                  {!openOrdersDataLoading && openOrdersdata.length > 0 && activeUser && (
                    <div className="col-12 px-0 mb-5">
                      <OpenOrders
                        onTransactionSuccess={updateOpenData}
                        data={openOrdersdata || []}
                        loading={openOrdersDataLoading}
                        username={(activeUser && activeUser.username) || ""}
                        activeUser={activeUser}
                      />
                    </div>
                  )}
                  <div className="col-12 col-xl-5 px-0">
                    <Orders
                      onPriceClick={(value) => setBidValues({ highest: value, lowest: value })}
                      type={1}
                      loading={loadingTablesData}
                      data={tablesData ? tablesData!.bids : []}
                    />
                  </div>
                  <div className="col-12 col-xl-5 px-0 px-sm-auto mt-5 mt-lg-0">
                    <Orders
                      onPriceClick={(value) => setBidValues({ lowest: value, highest: value })}
                      type={2}
                      loading={loadingTablesData}
                      data={tablesData ? tablesData!.asks : []}
                    />
                  </div>
                  <div className="col-12 px-0 px-sm-auto mt-5">
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
  ) : (
    <></>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(MarketPage as any);
