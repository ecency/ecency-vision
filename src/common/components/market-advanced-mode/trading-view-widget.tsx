import { History } from "history";
import React, { useEffect, useState } from "react";
import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import { _t } from "../../i18n";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { getMarketBucketSizes } from "../../api/hive";
import moment, { Moment } from "moment";
import { IChartApi, ISeriesApi, TimeRange } from "lightweight-charts";
import Dropdown from "../dropdown";
import useLocalStorage from "react-use/lib/useLocalStorage";
import useDebounce from "react-use/lib/useDebounce";
import { Global } from "../../store/global/types";
import { PREFIX } from "../../util/local-storage";
import { useResizeDetector } from "react-resize-detector";
import { useTradingViewApi } from "./api";

interface Props {
  global: Global;
  history: History;
  widgetTypeChanged: (type: Widget) => void;
}

interface TriggerFetch {
  fetch: boolean;
  loadMore: boolean;
}

const TRIGGER_FETCH_DEFAULT: TriggerFetch = { fetch: false, loadMore: false };
const HISTOGRAM_OPTIONS: any = {
  color: "#26a69a",
  priceFormat: {
    type: "volume"
  },
  priceScaleId: "",
  scaleMargins: {
    top: 0.8,
    bottom: 0
  }
};

export const TradingViewWidget = ({ history, widgetTypeChanged, global }: Props) => {
  const { width, height, ref: chartRef } = useResizeDetector();

  const [storedBucketSeconds, setStoredBucketSeconds] = useLocalStorage<number>(
    PREFIX + "_amml_tv_bs",
    300
  );

  const [data, setData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Moment>(moment().subtract(8, "hours"));
  const [endDate, setEndDate] = useState<Moment>(moment());
  const [bucketSeconds, setBucketSeconds] = useState(storedBucketSeconds ?? 300);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [chartSeries, setChartSeries] = useState<ISeriesApi<any> | null>(null);
  const [histoSeries, setHistoSeries] = useState<ISeriesApi<any> | null>(null);
  const [bucketSecondsList, setBucketSecondsList] = useState<number[]>([]);
  const [triggerFetch, setTriggerFetch] = useState<TriggerFetch>(TRIGGER_FETCH_DEFAULT);
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTimeRange, setLastTimeRange] = useState<TimeRange | null>(null);

  const { fetchData } = useTradingViewApi(setData);

  useDebounce(
    () => {
      if (!triggerFetch.fetch) return;

      setEndDate(startDate.clone().subtract(bucketSeconds, "seconds"));
      setStartDate(
        getNewStartDate(startDate.clone().subtract(bucketSeconds, "seconds"), "subtract")
      );
      fetchData(bucketSeconds, startDate, endDate, triggerFetch.loadMore);
      setTriggerFetch(TRIGGER_FETCH_DEFAULT);
    },
    300,
    [triggerFetch]
  );

  useEffect(() => {
    getMarketBucketSizes().then((sizes) => setBucketSecondsList(sizes));
    buildChart().then(() => fetchData(bucketSeconds, startDate, endDate));
  }, []);

  useEffect(() => {
    if (width && height) {
      chart?.resize(width, height);
    }
  }, [width, height]);

  useEffect(() => {
    const fromDate = lastTimeRange ? new Date(Number(lastTimeRange.from) * 1000) : null;
    if (fromDate) {
      if (lastTimeRange?.from === data[0]?.time) setTriggerFetch({ fetch: true, loadMore: true });
    }
  }, [lastTimeRange]);

  useEffect(() => {
    if (chartSeries) {
      chart?.removeSeries(chartSeries);
      setChartSeries(null);
    }

    if (histoSeries) {
      chart?.removeSeries(histoSeries);
      setHistoSeries(null);
    }

    setData([]);
    setEndDate(moment());
    setStartDate(getNewStartDate(moment(), "subtract"));
    setTriggerFetch({ fetch: true, loadMore: false });

    setStoredBucketSeconds(bucketSeconds);
  }, [bucketSeconds]);

  useEffect(() => {
    if (!chart) {
      return;
    }
    const candleStickSeries =
      chartSeries ??
      chart.addCandlestickSeries({
        priceFormat: {
          type: "price",
          precision: 5,
          minMove: 0.00001
        }
      });
    candleStickSeries.setData(data);

    const volumeSeries = histoSeries ?? chart.addHistogramSeries(HISTOGRAM_OPTIONS);
    volumeSeries.setData(
      data.map(({ time, volume, open, close }) => ({
        time,
        value: volume / 1000,
        color: open < close ? "rgba(0, 150, 136, 0.8)" : "rgba(255,82,82, 0.8)"
      }))
    );

    if (!isZoomed && data.length > 0) {
      chart?.timeScale().fitContent();
      setIsZoomed(true);
    }

    setChartSeries(candleStickSeries);
    setHistoSeries(volumeSeries);
  }, [data, chart]);

  useEffect(() => {
    if (chart) {
      chart.options().layout.textColor = global.theme == "night" ? "#fff" : "#000";
    }
  }, [global.theme]);

  const buildChart = async () => {
    const tradingView = await import("lightweight-charts");
    const chartInstance = tradingView.createChart(chartRef.current, {
      rightPriceScale: {
        scaleMargins: {
          top: 0.3,
          bottom: 0.25
        },
        borderVisible: false
      },
      timeScale: {
        timeVisible: true
      },
      layout: {
        background: {
          color: "transparent"
        },
        textColor: global.theme == "night" ? "#fff" : "#000"
      }
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

  const getBucketSecondsLabel = () => {
    switch (bucketSeconds) {
      case 15:
        return "15s";
      case 60:
        return "1m";
      case 300:
        return "5m";
      case 3600:
        return "1h";
      case 86400:
        return "1d";
      default:
        return "";
    }
  };

  return (
    <MarketAdvancedModeWidget
      history={history}
      className="market-advanced-mode-tv-widget pb-4"
      type={Widget.TradingView}
      title={
        <>
          <b>{_t("market.advanced.chart")}</b>
          <small className="pl-1">({getBucketSecondsLabel()})</small>
        </>
      }
      children={<div className="market-advanced-mode-trading-view-widget" ref={chartRef} />}
      widgetTypeChanged={widgetTypeChanged}
      settingsClassName="flex"
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
