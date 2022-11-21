import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Theme } from "../../store/global/types";
import ReactHighcharts from "react-highcharts"
import moment from 'moment';
import { _t } from '../../i18n';

export const HiveEngineChart = (props: any) => {
const { items, theme } = props
// console.log(items)

const [close, setClose]: any = useState([])
const [timeStamp, setTimeStamp]: any = useState([]);
const [tokenSymbol, setTokenSymbol] = useState("SWAP.HIVE")
const [prices, setPrices]: any = useState([])

useEffect(() => {
  const getMarketData = async (symbol: any) => {
      const { data: history } = await axios.get(
          `https://info-api.tribaldex.com/market/ohlcv`,
          {
            params: { symbol: items.symbol, interval: 'daily' },
          },
          );
          const close = history.map((token: any) =>  token.close)
          const closePrice = close.map((a: any) => Number(a))
          // console.log(closePrice)
          const timeStamp = history.map((token: any) => token.timestamp)
          const date = timeStamp.map((a: any) => new Date(a * 1000).toLocaleDateString("en-US"));
          setTimeStamp(date)
          setPrices(closePrice)
          setTokenSymbol(symbol)
  }
        getMarketData(tokenSymbol);
},[])

      const config: any = {
        title: {
          text: null
        },
        credits: { enabled: false },
        legend: {
          enabled: false
        },
        chart: {
          height: '70',
          width: '600',
          zoomType: "x",
          backgroundColor: "transparent",
          border: "none",
          style: {
            fontFamily: "inherit",
            border: 'none'
          },
          plotBorderColor: "transparent",
          plotBorderWidth: 0,
          plotBackgroundColor: "transparent",
          plotShadow: true,
          type: "area",
          spacingBottom: 0,
          spacingTop: 0,
          spacingLeft: 0,
          spacingRight: 0,
          marginTop: 0,
          marginBottom: 0,
          // marginLeft: 60,
        },
        plotOptions: {
          area: {
            // fillColor: theme === Theme.night ? "#2e3d51" : "#f3f7fb",
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
              color: 'red'
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
            data: prices.length === 0 ? [0,0] : prices,
            type: "line",
            enableMouseTracking: true
          }
        ]
      };

        const defaultOptions = {
    chart: {
      renderTo: true,
      backgroundColor: null,
      borderWidth: 0,
      type: 'line',
      margin: [2, 0, 2, 0],
      width: 120,
      height: 20,
      style: {
        overflow: 'visible'
      },
      // small optimalization, saves 1-2 ms each sparkline
      skipClone: true
    },
    title: {
      text: ''
    },
    credits: {
      enabled: false
    },
    xAxis: {
      labels: {
        enabled: false
      },
      title: {
        text: null
      },
      startOnTick: false,
      endOnTick: false,
      tickPositions: []
    },
    yAxis: {
      endOnTick: false,
      startOnTick: false,
      labels: {
        enabled: false
      },
      title: {
        text: null
      },
      tickPositions: [0]
    },
    legend: {
      enabled: false
    },
    tooltip: {
      hideDelay: 0,
      outside: true,
      shared: true
    },
    plotOptions: {
      series: {
        animation: false,
        lineWidth: 1,
        shadow: false,
        states: {
          hover: {
            lineWidth: 1
          }
        },
        marker: {
          radius: 1,
          states: {
            hover: {
              radius: 2
            }
          }
        },
        fillOpacity: 0.25
      },
      column: {
        negativeColor: '#910000',
        borderColor: 'silver'
      }
    }
  };


  return (
    <div className="market-graph d-flex justify-items-center ml-5" >
        <div className="graph">
          <ReactHighcharts config={config} />
        </div>      
      </div>
  )
}