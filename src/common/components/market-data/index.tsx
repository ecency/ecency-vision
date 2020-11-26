import React, {Component} from "react";

import moment from "moment";

import numeral from "numeral";

import Graph from "react-chartist";

import {ILineChartOptions} from "chartist";

import isEqual from "react-fast-compare";

import {getMarketData} from "../../api/misc";

import {_t} from "../../i18n";

interface Props {
    label: string;
    coin: string;
    vsCurrency: string;
    fromTs: string;
    toTs: string;
}

interface State {
    series: number[]
}

export class Market extends Component<Props, State> {
    state: State = {
        series: []
    }

    componentDidMount() {
        const {coin, vsCurrency, fromTs, toTs} = this.props;

        getMarketData(coin, vsCurrency, fromTs, toTs).then((r) => {
            if (r && r.prices) {
                const series = r.prices.map((x: any) => x[1]);
                this.setState({series});
            }
        });
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.state, nextState);
    }

    render() {
        const {series} = this.state;

        const options: ILineChartOptions = {
            width: "100%",
            height: "90px",
            showPoint: false,
            showArea: true,
            lineSmooth: false,
            fullWidth: true,
            chartPadding: {
                right: 0,
                left: -40,
                top: 0,
                bottom: -40,
            },
            axisX: {
                showLabel: false,
                showGrid: false
            },
            axisY: {
                showLabel: false,
                showGrid: false
            }
        };

        const data = {
            series: [series]
        };

        const {coin, label} = this.props;

        let strPrice = "...";
        if (series.length) {
            const price = series[series.length - 1];
            const formatter = coin === "bitcoin" ? ",$" : "0.00$";

            strPrice = numeral(price).format(formatter)
        }

        return <div className="market-graph">
            <div className="graph"><Graph data={data} options={options} type="Line"/></div>
            <div className="price"><span className="coin">{label}</span>{" "}<span className="value">{strPrice}</span></div>
        </div>;
    }
}

export default class MarketData extends Component {
    render() {
        const fromTs = moment().subtract(2, "days").format("X");
        const toTs = moment().format("X");

        return <div className="market-data">
            <div className="market-data-header">{_t("market-data.title")}</div>
            <Market label="HIVE" coin="hive" vsCurrency="usd" fromTs={fromTs} toTs={toTs}/>
            <Market label="HBD" coin="hive_dollar" vsCurrency="usd" fromTs={fromTs} toTs={toTs}/>
            <Market label="BTC" coin="bitcoin" vsCurrency="usd" fromTs={fromTs} toTs={toTs}/>
        </div>
    }
}
