import { History } from "history";
import React, { useEffect, useRef, useState } from "react";
import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import { _t } from "../../i18n";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { getMarketBucketSizes, getMarketHistory, MarketCandlestickDataItem } from "../../api/hive";
import moment, { Moment } from "moment";
import { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import Dropdown from "../dropdown";

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

  useEffect(() => {
    getMarketBucketSizes().then((sizes) => setBucketSecondsList(sizes));
    buildChart().then(() => fetchData());
  }, []);

  useEffect(() => {
    fetchData();
  }, [bucketSeconds]);

  useEffect(() => {
    if (!chart) {
      return;
    }
    const candleStickSeries = chartSeries ?? chart.addCandlestickSeries();
    const candleStickData = data.map(({ hive, non_hive, open }) => ({
      close: hive.close / non_hive.close,
      open: hive.open / non_hive.open,
      low: hive.low / non_hive.low,
      high: hive.high / non_hive.high,
      volume: non_hive.volume,
      time: (moment(open).toDate().getTime() / 1000) as Time
    }));
    candleStickSeries.setData(candleStickData);
    chart.timeScale().fitContent();

    setChartSeries(candleStickSeries);
  }, [data, chart]);

  const fetchData = async () => {
    const data = await getMarketHistory(bucketSeconds, startDate, endDate);
    setData(data);
  };

  const buildChart = async () => {
    const tradingView = await import("lightweight-charts");
    setChart(
      tradingView.createChart(chartRef.current, {
        timeScale: {
          timeVisible: true
        },
        height: 400
      })
    );
  };

  const onBucketSecondsChange = (value: number) => {
    let newStartDate = endDate.clone();
    if (value === 15) newStartDate = newStartDate.subtract(4, "hours");
    if (value === 60) newStartDate = newStartDate.subtract(8, "hours");
    if (value === 300) newStartDate = newStartDate.subtract(8, "hours");
    if (value === 3600) newStartDate = newStartDate.subtract(1, "days");
    if (value === 86400) newStartDate = newStartDate.subtract(20, "days");
    setStartDate(newStartDate);
    setBucketSeconds(value);
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
              onClick: () => onBucketSecondsChange(size)
            }))}
          />
        </>
      }
    />
  );
};
