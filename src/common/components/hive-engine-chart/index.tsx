import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { trackEntryPin } from '../../store/entry-pin-tracker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const HiveEngineChart = (props: any) => {
const { items } = props
// console.log(items)
const symbols = items.map((a: { symbol: any }) => a.symbol)

const [close, setClose]: any = useState([])
const [timeStamp, setTimeStamp]: any = useState([]);
const [tokenSymbol, setTokenSymbol] = useState("SWAP.HIVE")

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
            const close = history.map((token: any) => token.close )
            console.log(close)
            const timeStamp = history.map((token: any) => token.timestamp)
            console.log(timeStamp)
            setClose(close)
            setTimeStamp(timeStamp)
            // return history
    }

    const data = {
      labels: timeStamp,
      datasets: [{
      label: "Close",
      fill: true,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      data: close
      }]
      }
      
      const options: any = {
        responsive: true
      }

  return (
    <div style={{width: 700, backgroundColor: "#283241"}}>
        <Line options={options} data={data} />
    </div>
  )
}
