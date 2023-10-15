import React, { useEffect, useState } from "react";
import { Theme } from "../../store/global/types";
import ReactHighcharts from "react-highcharts";
import moment from "moment";
import { _t } from "../../i18n";
import { getMarketData } from "../../api/hive-engine";
import "./_index.scss";

export const HiveEngineChart = (props: any) => {
  const { items, theme } = props;

  const [prices, setPrices]: any = useState([]);

  useEffect(() => {
    getHistory();
  }, []);

  const getHistory = async () => {
    const history = await getMarketData(items.symbol);
    const close = history.map((token: any) => token.close);
    const closePrice = close.map((a: any) => Number(a));
    setPrices(closePrice);
  };

  const config: any = {
    title: {
      text: null
    },
    credits: { enabled: false },
    legend: {
      enabled: false
    },
    chart: {
      height: "70",
      width: "600",
      zoomType: "x",
      backgroundColor: "transparent",
      border: "none",
      style: {
        fontFamily: "inherit",
        border: "none"
      },
      plotBorderColor: "transparent",
      plotBorderWidth: 0,
      plotBackgroundColor: "transparent",
      plotShadow: false,
      type: "area",
      spacingBottom: 0,
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 0,
      marginTop: 0,
      marginBottom: 0
    },
    plotOptions: {
      area: {
        fillColor: theme === Theme.night ? "#2e3d51" : "#f3f7fb",
        lineColor: "transparent",
        lineWidth: 399
      },
      series: {
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: false
            }
          }
        }
      }
    },
    tooltip: {
      valueDecimals: 2,
      useHTML: true,
      shadow: false,
      formatter: (({ chart }: any) => {
        let date = moment(chart.hoverPoint.options.x).calendar();
        let rate = chart.hoverPoint.options.y;
        return `<div><div>${_t("g.when")}: <b>${date}</b></div><div>${_t(
          "g.price"
        )}:<b>${rate.toFixed(3)}</b></div></div>`;
      }) as any,
      enabled: true
    },
    xAxis: {
      lineWidth: 0,
      minorGridLineWidth: 0,
      lineColor: "transparent",
      // categories: timeStamp,
      labels: {
        enabled: false,
        style: {
          color: "red"
        }
      },
      title: {
        text: null
      },
      minorTickLength: 0,
      tickLength: 0,
      grid: {
        enabled: false
      },
      gridLineWidth: 0
    },
    yAxis: {
      lineWidth: 0,
      minorGridLineWidth: 0,
      lineColor: "transparent",
      title: {
        text: null
      },
      labels: {
        enabled: false
      },
      minorTickLength: 0,
      tickLength: 0,
      gridLineWidth: 0
    },
    series: [
      {
        name: "tokens",
        data: prices.length === 0 ? [0, 0] : prices,
        type: "line",
        enableMouseTracking: true
      }
    ]
  };
  return (
    <div className="market-graph flex justify-center ml-5">
      <div className="graph">
        <ReactHighcharts config={config} />
      </div>
    </div>
  );
};
