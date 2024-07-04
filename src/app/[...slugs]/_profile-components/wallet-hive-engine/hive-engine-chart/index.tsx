import React, { useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import "./_index.scss";
import { getMarketData } from "@/api/hive-engine";
import { Theme } from "@/enums";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import useMount from "react-use/lib/useMount";

export const HiveEngineChart = ({ items }: any) => {
  const theme = useGlobalStore((s) => s.theme);
  const [prices, setPrices]: any = useState([]);

  useMount(() => {
    getHistory();
  });

  const getHistory = async () => {
    const history = await getMarketData(items.symbol);
    const close = history.map((token: any) => token.close);
    const closePrice = close.map((a: any) => Number(a));
    setPrices(closePrice);
  };

  const config: any = useMemo(
    () => ({
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
          return `<div><div>${i18next.t("g.when")}: <b>${date}</b></div><div>${i18next.t(
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
    }),
    [prices, theme]
  );
  return (
    <div className="market-graph flex justify-center ml-5">
      <div className="graph">
        <HighchartsReact highcharts={Highcharts} config={config} />
      </div>
    </div>
  );
};
