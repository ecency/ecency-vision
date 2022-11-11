import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Theme } from "../../store/global/types";
// import ReactHighcharts from "react-highcharts";
const ReactHighcharts = require("react-highcharts/dist/ReactHighstock");
// import { Line } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Filler,
//   Legend,
// } from 'chart.js';
// import { trackEntryPin } from '../../store/entry-pin-tracker';
import moment from 'moment';
import { _t } from '../../i18n';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Filler,
//   Legend
// );

export const HiveEngineChart = (props: any) => {
const { items } = props
// console.log(items)
const symbols = items.map((a: { symbol: any }) => a.symbol)

const [close, setClose]: any = useState([])
const [timeStamp, setTimeStamp]: any = useState([]);
const [tokenSymbol, setTokenSymbol] = useState("SWAP.HIVE")
const [prices, setPrices] = useState()

useEffect(() => {
  getMarketData(tokenSymbol);
})

    const getMarketData = async (symbol: any) => {
        const { data: history } = await axios.get(
            `https://info-api.tribaldex.com/market/ohlcv`,
            {
              params: { symbol, interval: 'daily' },
            },
            );
            console.log(history)
            const close = history.map((token: any) =>  token.close)
            // console.log(close)
            const closePrice = close.map((a: any) => Number(a))
            console.log(closePrice)
            const timeStamp = history.map((token: any) => token.timestamp)
            // console.log(timeStamp)
            const date = timeStamp.map((a: any) => new Date(a * 1000).toLocaleDateString("en-US"));
            setTimeStamp(date)
            setPrices(closePrice)
    }

    // const data = {
    //   labels: timeStamp,
    //   datasets: [{
    //   label: "Close",
    //   fill: true,
    //   borderColor: 'rgb(53, 162, 235)',
    //   backgroundColor: 'rgba(53, 162, 235, 0.5)',
    //   data: close
    //   }]
    //   }
      
      // const options: any = {
      //   series: [
      //     name: "Tokens",
      //     data: closed
      //   ] 
      // }

      const config: any = {
        title: {
          text: null
        },
        credits: { enabled: false },
        legend: {
          enabled: false
        },
        chart: {
          height: 280,
          zoomType: "x",
          // backgroundColor: theme === Theme.night ? "#161d26" : ""
        },
        plotOptions: {
          area: {
            // fillColor: theme === Theme.night ? "#2e3d51" : "#f3f7fb",
            lineColor: "#81acef",
            lineWidth: 3
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
            enabled: false
          },
          title: {
            text: null
          },
          minorTickLength: 0,
          tickLength: 0,
          gridLineWidth: 0
        },
        // yAxis: {
        //   lineWidth: 0,
        //   minorGridLineWidth: 0,
        //   lineColor: "transparent",
        //   title: {
        //     text: null
        //   },
        //   labels: {
        //     enabled: false
        //   },
        //   minorTickLength: 0,
        //   tickLength: 0,
        //   gridLineWidth: 0
        // },
        series: [
          {
            name: "tokens",
            data: prices,
            type: "line",
            enableMouseTracking: true
          }
        ]
      };
  

      // let config = {
      //   xAxis: {
      //     categories: timeStamp
      //   },
      //   series: [{
      //     data: prices
      //   }]
      // };

  return (
    <div className="market-graph" style={{width: 500}}>
        <div className="graph">
          <ReactHighcharts config={config} />
        </div>
        <div className="info">
          <div className="price">
            <span className="coin">{tokenSymbol}</span> 
            <span className="value">prices</span>
          </div>
          <div className="tooltip" />
        </div>
      </div>
  )
}
