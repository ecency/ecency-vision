import React from 'react';
import PropTypes from 'prop-types';
import { _t } from '../../i18n';
import { useEffect } from 'react';
const ReactHighcharts = require('react-highcharts/dist/ReactHighstock');
const power = 100;
const precision = 1000;

function orderEqual(a:any, b:any) {
    return a.price === b.price && a.hive === b.hive && a.hbd === b.hbd;
}

function ordersEqual(a:any, b:any) {
    if (a.length !== b.length) {
        return false;
    }

    for (let key in a) {
        if (!(key in b) || !orderEqual(a[key], b[key])) {
            return false;
        }
    }

    for (let key in b) {
        if (!(key in a) || !orderEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;
}


const MarketChart = ({ bids, asks }:any) => {
  useEffect(()=>{
      //   if(bids || asks){
      //     if (chart && 'series' in chart && chart.series.length === 2) {
      //     const { bids, asks } = generateBidAsk(
      //         nextProps.bids,
      //         nextProps.asks
      //     );
      //     const { min, max } = getMinMax(bids, asks);

      //     chart.series[0].setData(bids);
      //     chart.series[1].setData(asks);
      //     chart.xAxis[0].setExtremes(min, max);
      //     return false;
      //  }
      // }
  },[bids, asks])

  if (!bids.length && !asks.length) {
      return null;
  }

  const depth_chart_config = generateDepthChart(bids, asks);
  debugger
  return <div className="DepthChart">
      <ReactHighcharts config={depth_chart_config} />
  </div>
}

export default MarketChart;

function generateBidAsk(bidsArray:any, asksArray:any) {
    // Input raw orders (from TOP of order book DOWN), output grouped depth
    function aggregateOrders(orders:any) {
        if (typeof orders == 'undefined') {
            return [];
        }

        let ttl = 0;
        return orders
            .map((o:any) => {
                ttl += o.hbd;
                return [o.real_price * power, ttl];
            })
            .sort((a:any, b:any) => {
                // Sort here to make sure arrays are in the right direction for HighCharts
                return a[0] - b[0];
            });
    }

    let bids = aggregateOrders(bidsArray);
    // Insert a 0 entry to make sure the chart is centered properly
    bids.unshift([0, bids[0][1]]);

    let asks = aggregateOrders(asksArray);
    debugger
    // Insert a final entry to make sure the chart is centered properly
    asks.push([asks[asks.length - 1][0] * 4, asks[asks.length - 1][1]]);

    return { bids, asks };
}

function getMinMax(bids:any, asks:any) {
    const highestBid = bids.length ? bids[bids.length - 1][0] : 0;
    const lowestAsk = asks.length ? asks[0][0] : 1;

    const middle = (highestBid + lowestAsk) / 2;

    return {
        min: Math.max(middle * 0.65, bids[0][0]),
        max: Math.min(middle * 1.35, asks[asks.length - 1][0]),
    };
}

function generateDepthChart(bidsArray:any, asksArray:any) {
    const { bids, asks } = generateBidAsk(bidsArray, asksArray);
    let series = [];

    const { min, max } = getMinMax(bids, asks);
    if (bids[0]) {
        series.push({
            step: 'right',
            name: _t('g.bid'),
            color: 'rgba(0,150,0,1.0)',
            fillColor: 'rgba(0,150,0,0.2)',
            tooltip: { valueSuffix: ' ' + 'LIQUID_TICKER' },
            data: bids,
        });
    }
    if (asks[0]) {
        series.push({
            step: 'left',
            name: _t('g.ask'),
            color: 'rgba(150,0,0,1.0)',
            fillColor: 'rgba(150,0,0,0.2)',
            tooltip: { valueSuffix: ' ' + 'LIQUID_TICKER' },
            data: asks,
        });
    }
    
    let depth_chart_config = {
        title: { text: null },
        subtitle: { text: null },
        chart: { type: 'area', zoomType: 'x' },
        xAxis: {
            min: min,
            max: max,
            // labels: {
            //     formatter: () => {
            //         return this.value / power;
            //     },
            // },
            ordinal: false,
            lineColor: '#000000',
            title: {
                text: null,
            },
        },
        yAxis: {
            title: { text: null },
            lineWidth: 2,
            labels: {
                align: 'left',
                // formatter: function() {
                //     const value = this.value / precision;
                //     return (
                //         '$' +
                //         (value > 1e6
                //             ? (value / 1e6).toFixed(3) + 'M'
                //             : value > 10000
                //               ? (value / 1e3).toFixed(0) + 'k'
                //               : value)
                //     );
                // },
            },
            gridLineWidth: 1,
        },
        legend: { enabled: false },
        credits: {
            enabled: false,
        },
        rangeSelector: {
            enabled: false,
        },
        navigator: {
            enabled: false,
        },
        scrollbar: {
            enabled: false,
        },
        dataGrouping: {
            enabled: false,
        },
        tooltip: {
            shared: false,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            // formatter: () => {
            //     return (
            //         `<span>${_t('g.price')}: ${(this.x / power).toFixed(6)} ${
            //             'CURRENCY_SIGN'
            //         }/LIQUID_TOKEN_UPPERCASE</span><br/><span>\u25CF</span>${
            //             this.series.name
            //         }: <b>${(this.y / 1000).toFixed(3)} DEBT_TOKEN_SHORT ` +
            //         '(' +
            //         'CURRENCY_SIGN' +
            //         ')</b>'
            //     );
            // },
            style: {
                color: '#FFFFFF',
            },
        },
        plotOptions: { series: { animation: true } },
        series,
    };

    return depth_chart_config;
}
