import { IChartOptions } from 'chartist';
import { range } from 'lodash';
import React from 'react';
import ChartistGraph from 'react-chartist';
export interface MarketChartProps {
    data1: number[],
    data2: number[],
}

export const MarketChart = ({data1, data2}:MarketChartProps) => {
    var data = {
      labels: range(0,2,0.1).map(item=>parseFloat(item.toFixed(1))),
      series: [
        data1,
        data2,
      ]
    };

    var options = {
      high: 20000,
      low: 0,
      showArea:true,
      chartPadding: {
          right: 0,
          left: 0,
          top: 0,
          bottom: 0,
      },
    };

    var type = 'Line'
    debugger
    return (    
        <div className="mt-5 mb-3">
          <ChartistGraph data={data} options={options as IChartOptions} type={type} />
        </div>
      ) 
}