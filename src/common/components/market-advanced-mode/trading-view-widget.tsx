import { History } from "history";
import React, { useEffect, useRef, useState } from "react";
import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import { _t } from "../../i18n";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { getMarketBucketSizes, getMarketHistory, MarketCandlestickDataItem } from "../../api/hive";
import moment, { Moment } from "moment";
import { IChartApi, ISeriesApi, Time, TimeRange } from "lightweight-charts";
import Dropdown from "../dropdown";
import { useDebounce } from "react-use";

interface Props {
  history: History;
  widgetTypeChanged: (type: Widget) => void;
}

export const TradingViewWidget = ({ history, widgetTypeChanged }: Props) => {
  const chartRef = useRef<any>();
  const [data, setData] = useState<MarketCandlestickDataItem[]>([]);
  const [startDate, setStartDate] = useState<Moment>(moment().subtract(8, "hours"));
  const [endDate, setEndDate] = useState<Moment>(moment());
  const [bucketSeconds, setBucketSeconds] = useState(300);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [chartSeries, setChartSeries] = useState<ISeriesApi<any> | null>(null);
  const [bucketSecondsList, setBucketSecondsList] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(false);

  const [lastTimeRange, setLastTimeRange] = useState<TimeRange | null>(null);

  useDebounce(
    () => {
      if (!triggerFetch) return;

      setEndDate(startDate.clone().subtract(bucketSeconds, "seconds"));
      setStartDate(
        getNewStartDate(startDate.clone().subtract(bucketSeconds, "seconds"), "subtract")
      );
      fetchData(true);
      setTriggerFetch(false);
    },
    300,
    [triggerFetch]
  );

  useEffect(() => {
    getMarketBucketSizes().then((sizes) => setBucketSecondsList(sizes));
    buildChart().then(() => fetchData());
  }, []);

  useEffect(() => {
    const fromDate = lastTimeRange ? new Date(Number(lastTimeRange.from) * 1000) : null;
    if (fromDate) {
      const diff = startDate.diff(getNewStartDate(moment(fromDate), "subtract"), "hours");

      if (diff >= 0 && diff <= bucketSeconds * 60) setTriggerFetch(true);
    }
  }, [lastTimeRange]);

  useEffect(() => {
    setData([]);
    setEndDate(moment());
    setStartDate(getNewStartDate(moment(), "subtract"));
  }, [bucketSeconds]);

  useEffect(() => {
    if (!chart) {
      return;
    }
    const candleStickSeries = chartSeries ?? chart.addCandlestickSeries();
    const candleStickData = data
      .map(({ hive, non_hive, open }) => ({
        close: hive.close / non_hive.close,
        open: hive.open / non_hive.open,
        low: hive.low / non_hive.low,
        high: hive.high / non_hive.high,
        volume: non_hive.volume,
        time: Math.floor(moment(open).toDate().getTime() / 1000) as Time
      }))
      .reduce((acc, item) => acc.set(item.time, item), new Map<Time, any>());
    candleStickSeries.setData(
      Array.from(candleStickData.values()).sort((a, b) => Number(a.time) - Number(b.time))
    );

    setChartSeries(candleStickSeries);
  }, [data, chart]);

  const fetchData = async (loadMore?: boolean) => {
    setIsLoading(true);
    const apiData = await getMarketHistory(bucketSeconds, startDate, endDate);
    if (loadMore) {
      setData([...data, ...apiData]);
    } else {
      setData(apiData);
    }
    setIsLoading(false);
  };

  const buildChart = async () => {
    const tradingView = await import("lightweight-charts");
    const chartInstance = tradingView.createChart(chartRef.current, {
      timeScale: {
        timeVisible: true
      },
      height: 400
    });

    chartInstance
      .timeScale()
      .subscribeVisibleTimeRangeChange((timeRange) => setLastTimeRange(timeRange));
    setChart(chartInstance);
  };

  const getNewStartDate = (date: Moment, operation: "add" | "subtract") => {
    let newStartDate = date.clone();
    let value = 0;
    let unit: "hours" | "days" = "hours";
    if (bucketSeconds === 15) value = 4;
    if (bucketSeconds === 60) value = 8;
    if (bucketSeconds === 300) value = 8;
    if (bucketSeconds === 3600) {
      value = 1;
      unit = "days";
    }
    if (bucketSeconds === 86400) {
      value = 20;
      unit = "days";
    }

    if (operation === "add") newStartDate = newStartDate.add(value, unit);
    if (operation === "subtract") newStartDate = newStartDate.subtract(value, unit);

    return newStartDate;
  };

  return (
    <MarketAdvancedModeWidget
      history={history}
      type={Widget.TradingView}
      title={
        <>
          <b>{_t("market.advanced.chart")}</b>
          <small className="pl-1">({bucketSeconds} seconds per candle)</small>
        </>
      }
      children={<div className="market-advanced-mode-trading-view-widget" ref={chartRef} />}
      widgetTypeChanged={widgetTypeChanged}
      settingsClassName="d-flex"
      additionalSettings={
        <>
          <Dropdown
            float="none"
            label="Bucket size"
            history={history}
            items={bucketSecondsList.map((size) => ({
              label: `${size}`,
              selected: bucketSeconds === size,
              onClick: () => setBucketSeconds(size)
            }))}
          />
        </>
      }
    />
  );
};
