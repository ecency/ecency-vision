import React, { useEffect, useState } from 'react'
import ReactHighcharts from "react-highcharts";
import { Theme } from "../../store/global/types";
import { _t } from "../../i18n";
import { marketChart } from '../../api/misc'
import moment from "moment";

export const HiveWalletPortfolioChart = (props: any) => {
    const { theme } = props;

    const [prices, setPrices] = useState([]);
    
    useEffect(() => {
        marketChartInfo();
    }, []);

    const marketChartInfo = async () => {
        const data: any = await marketChart("hive");
            setPrices(data.prices);
    }
    
    const config: any = {
        title: {
          text: null
        },
        credits: { enabled: false },
        legend: {
          enabled: false
        },
        chart: {
          height: "40",
          width: "100",
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
            lineWidth: 150
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
        <div className="market-graph d-flex justify-items-center">
          <div className="graph">
            <ReactHighcharts config={config} />
          </div>
        </div>
      );
    };

export const HbdWalletPortfolioChart = (props: any) => {
    const { theme } = props;

    const [prices, setPrices] = useState([]);
    
    useEffect(() => {
        marketChartInfo();
    }, []);

    const marketChartInfo = async () => {
        const data: any = await marketChart("hive_dollar");
            setPrices(data.prices);
    }
    
    const config: any = {
        title: {
          text: null
        },
        credits: { enabled: false },
        legend: {
          enabled: false
        },
        chart: {
          height: "40",
          width: "100",
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
            lineWidth: 150
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
        <div className="market-graph d-flex justify-items-center">
          <div className="graph">
            <ReactHighcharts config={config} />
          </div>
        </div>
      );
    };
export const DefaultPortfolioChart = (props: any) => {
    const { theme } = props;
  
    const config: any = {
        title: {
          text: null
        },
        credits: { enabled: false },
        legend: {
          enabled: false
        },
        chart: {
          height: "40",
          width: "100",
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
            lineWidth: 150
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
            data: [0, 0],
            type: "line",
            enableMouseTracking: true
          }
        ]
      };
      return (
        <div className="market-graph d-flex justify-items-center">
          <div className="graph">
            <ReactHighcharts config={config} />
          </div>
        </div>
      );
    };
