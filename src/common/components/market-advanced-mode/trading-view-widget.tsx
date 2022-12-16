import { History } from "history";
import React, { useEffect, useRef, useState } from "react";
import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import { _t } from "../../i18n";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { getMarketHistory, MarketCandlestickDataItem } from "../../api/hive";
import moment, { Moment } from "moment";
import { IChartApi, Time } from "lightweight-charts";

interface Props {
  history: History;
  widgetTypeChanged: (type: Widget) => void;
}

export const TradingViewWidget = ({ history, widgetTypeChanged }: Props) => {
  const chartRef = useRef<any>();
  const [data, setData] = useState<MarketCandlestickDataItem[]>([]);
  const [startDate, setStartDate] = useState<Moment>(moment().subtract(1, "days"));
  const [endDate, setEndDate] = useState<Moment>(moment());
  const [bucketSeconds, setBucketSeconds] = useState(300);
  const [chart, setChart] = useState<IChartApi>(null);

  useEffect(() => {
    buildChart().then(() => fetchData());
  }, []);

  useEffect(() => {
    if (!chart) {
      return;
    }
    const candleStickSeries = chart.addCandlestickSeries();
    const candleStickData = data
      .map((item) => ({ item: item.hive, open: item.open }))
      .map(({ item, open }) => ({
        close: item.close / 1000,
        open: item.open / 1000,
        low: item.low / 1000,
        high: item.high / 1000,
        volume: item.volume / 1000,
        time: (moment(open).toDate().getTime() / 1000) as Time
      }));
    candleStickSeries.setData(candleStickData);
    chart.timeScale().fitContent();
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

  return (
    <MarketAdvancedModeWidget
      history={history}
      type={Widget.TradingView}
      title={_t("market.advanced.chart")}
      children={<div className="market-advanced-mode-trading-view-widget" ref={chartRef} />}
      widgetTypeChanged={widgetTypeChanged}
    />
  );
};
