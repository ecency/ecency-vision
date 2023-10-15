import React, { useEffect } from "react";
import { _t } from "../../i18n";
import { Theme } from "../../store/global/types";
import "./_index.scss";

const ReactHighcharts = require("react-highcharts/dist/ReactHighstock");
const power = 100;
const precision = 1000;

const MarketChart = ({ bids, asks, theme }: any) => {
  if (!bids.length && !asks.length) {
    return null;
  }

  useEffect(() => {
    if (theme) {
      // I know I'm adding this logic out of nowhere here but if I
      // touch the exisiting logic that's there for mobile, I know I'll break
      // many pages that will be hard to detect. It works fine here.
      // We can refactor it later in toggleTheme()

      if (theme === "night") {
        document.body.classList.add(`dark`);
      } else {
        document.body.classList.remove("dark");
      }
    }
  }, [theme]);

  const depth_chart_config = generateDepthChart(bids, asks, theme);
  return (
    <div className="DepthChart">
      <ReactHighcharts config={depth_chart_config} />
    </div>
  );
};

export default MarketChart;

function generateBidAsk(bidsArray: any, asksArray: any) {
  // Input raw orders (from TOP of order book DOWN), output grouped depth
  function aggregateOrders(orders: any) {
    if (typeof orders == "undefined") {
      return [];
    }

    let ttl = 0;
    return orders
      .map((o: any) => {
        ttl += o.hbd;
        return [o.real_price * power, ttl];
      })
      .sort((a: any, b: any) => {
        // Sort here to make sure arrays are in the right direction for HighCharts
        return a[0] - b[0];
      });
  }

  let bids = aggregateOrders(bidsArray);
  // Insert a 0 entry to make sure the chart is centered properly
  bids.unshift([0, bids[0][1]]);

  let asks = aggregateOrders(asksArray);
  // Insert a final entry to make sure the chart is centered properly
  asks.push([asks[asks.length - 1][0] * 4, asks[asks.length - 1][1]]);

  return { bids, asks };
}

function getMinMax(bids: any, asks: any) {
  const highestBid = bids.length ? bids[bids.length - 1][0] : 0;
  const lowestAsk = asks.length ? asks[0][0] : 1;

  const middle = (highestBid + lowestAsk) / 2;

  return {
    min: Math.max(middle * 0.65, bids[0][0]),
    max: Math.min(middle * 1.35, asks[asks.length - 1][0])
  };
}

function generateDepthChart(bidsArray: any, asksArray: any, theme: string) {
  const { bids, asks } = generateBidAsk(bidsArray, asksArray);
  let series = [];

  const { min, max } = getMinMax(bids, asks);
  if (bids[0]) {
    series.push({
      step: "right",
      name: _t("market.bid"),
      color: "rgba(0,150,0,1.0)",
      dataGrouping: {
        enabled: false
      },
      fillColor: "rgba(0,150,0,0.2)",
      data: bids
    });
  }
  if (asks[0]) {
    series.push({
      step: "left",
      name: _t("market.ask"),
      color: "rgba(150,0,0,1.0)",
      fillColor: "rgba(150,0,0,0.2)",
      data: asks
    });
  }

  let depth_chart_config = {
    title: { text: null },
    subtitle: { text: null },
    chart: {
      type: "area",
      zoomType: "x",
      backgroundColor: theme === Theme.night ? "#202834" : "white"
    },
    xAxis: {
      min: min,
      max: max,
      labels: {
        formatter: (values: any) => {
          return values.value / power;
        }
      },
      ordinal: false,
      lineColor: "#000000",
      title: {
        text: null
      }
    },
    yAxis: {
      title: { text: null },
      lineWidth: 2,
      labels: {
        align: "left",
        formatter: (values: any) => {
          const value = values.value / precision;
          let label =
            "$" +
            (value > 1e6
              ? (value / 1e6).toFixed(3) + "M"
              : value > 10000
              ? (value / 1e3).toFixed(0) + "k"
              : value);
          return label;
        }
      },
      gridLineWidth: 1
    },
    legend: { enabled: false },
    credits: {
      enabled: false
    },
    rangeSelector: {
      enabled: false
    },
    navigator: {
      enabled: false
    },
    scrollbar: {
      enabled: false
    },
    dataGrouping: {
      enabled: false
    },
    tooltip: {
      shared: false,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      formatter: ({
        chart: {
          hoverPoint: {
            options: { x, y }
          },
          hoverSeries: { name }
        }
      }: any) => {
        return (
          `<span>${_t("market.price")}: ${(x / power).toFixed(
            6
          )} ${"$/HIVE"}</span><br/><span>\u25CF</span>${name}: <b>${(y / 1000).toFixed(
            3
          )} HBD ($) ` + "</b>"
        );
      },
      style: {
        color: "#FFFFFF"
      }
    },
    plotOptions: { series: { animation: true } },
    series
  };

  return depth_chart_config;
}
