import React, {Component} from "react";

import moment from "moment";

import numeral from "numeral";

import Graph from "react-chartist";

import {ILineChartOptions} from "chartist";

import isEqual from "react-fast-compare";

import BaseComponent from "../base";

import {getMarketData} from "../../api/misc";

import {_t} from "../../i18n";

import {Tsx} from "../../i18n/helper";
import * as ls from "../../util/local-storage";

interface Price {
    time: number;
    price: number;
}

interface Props {
    label: string;
    coin: string;
    vsCurrency: string;
    fromTs: string;
    toTs: string;
    formatter: string;
}

interface State {
    prices: Price[]
}

export class Market extends BaseComponent<Props, State> {
    state: State = {
        prices: []
    }

    node = React.createRef<HTMLDivElement>();

    componentDidMount() {
        const {coin, vsCurrency, fromTs, toTs} = this.props;

        getMarketData(coin, vsCurrency, fromTs, toTs).then((r) => {
            if (r && r.prices) {
                const prices: Price[] = r.prices.map((x: any) => ({time: x[0], price: x[1]}));
                ls.set("marketData", prices);
                this.stateSet({prices}, () => {
                    this.attachEvents();
                });
            }
        }).catch(err => {
            let cachedData = ls.get("marketData")
            if(cachedData) {
                this.stateSet({prices: cachedData}, () => {
                    this.attachEvents();
                });
            }
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        this.detachEvents();
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.state, nextState);
    }

    attachEvents = () => {
        const node = this.node.current;
        if (!node) return;

        const graph = node.querySelector(".graph")!;

        node.querySelectorAll('.ct-point').forEach(el => {
            const left = el.getAttribute("x1");

            const graphBar = document.createElement("span");
            graphBar.setAttribute("class", "graph-bar");
            graphBar.style.left = `${left}px`;

            graphBar.addEventListener('mouseover', this.pointMouseMove);
            graphBar.addEventListener('mouseout', this.pointMouseOut);

            graph.appendChild(graphBar);
        });
    }

    detachEvents = () => {

        const node = this.node.current;
        if (!node) return;

        node.querySelectorAll('.graph-bar').forEach(el => {
            el.removeEventListener('mouseover', this.pointMouseMove);
            el.removeEventListener('mouseout', this.pointMouseOut);
        });
    }

    pointMouseMove = (e: Event) => {
        const node = this.node.current;
        if (!node) return;

        const {formatter} = this.props;

        const circle = e.currentTarget;
        const circles = node.querySelectorAll('.graph-bar');
        const index = Array.prototype.indexOf.call(circles, circle);
        const item = this.state.prices[index];

        const strPrice = numeral(item.price).format(formatter);
        const strDate = moment(item.time).format("YYYY-MM-DD HH:mm:ss");
        const html = `<strong>${strPrice}</strong> ${strDate}`;

        const tooltip = node.querySelector(".tooltip") as HTMLElement;
        tooltip.style.visibility = "visible";
        tooltip!.innerHTML = html;
    }

    pointMouseOut = () => {
        const node = this.node.current;
        if (!node) return;

        const tooltip = node.querySelector(".tooltip") as HTMLElement;
        tooltip.style.visibility = "hidden";
        tooltip!.innerHTML = "";
    }

    render() {
        const {label, formatter} = this.props;
        const {prices} = this.state;

        const options: ILineChartOptions = {
            width: "100%",
            height: "90px",
            showPoint: true,
            showArea: true,
            lineSmooth: false,
            fullWidth: true,
            chartPadding: {
                right: 0,
                left: 0,
                top: 0,
                bottom: 0,
            },
            axisX: {
                offset: 0,
                showLabel: false,
                showGrid: false
            },
            axisY: {
                offset: 0,
                showLabel: false,
                showGrid: false
            }
        };

        const data = {series: [prices.map(x => x.price)]};

        let strPrice = "...";
        if (prices.length) {
            const price = prices[prices.length - 1].price;
            strPrice = numeral(price).format(formatter);
        }

        return <div className="market-graph" ref={this.node}>
            <div className="graph">
                <Graph data={data} options={options} type="Line"/>
            </div>
            <div className="info">
                <div className="price">
                    <span className="coin">{label}</span>{" "}<span className="value">{strPrice}</span>
                </div>
                <div className="tooltip"/>
            </div>
        </div>;
    }
}

export default class MarketData extends Component {
    render() {
        const fromTs = moment().subtract(2, "days").format("X");
        const toTs = moment().format("X");

        return <div className="market-data">
            <div className="market-data-header">
                <span className="title">{_t("market-data.title")}</span>
                <Tsx k="market-data.credits" args={{}}>
                    <div className="credits"/>
                </Tsx>
            </div>
            <Market label="HIVE" coin="hive" vsCurrency="usd" fromTs={fromTs} toTs={toTs} formatter="0.000$"/>
            <Market label="HBD" coin="hive_dollar" vsCurrency="usd" fromTs={fromTs} toTs={toTs} formatter="0.000$"/>
            <Market label="BTC" coin="bitcoin" vsCurrency="usd" fromTs={fromTs} toTs={toTs} formatter=",$"/>
            <Market label="ETH" coin="ethereum" vsCurrency="usd" fromTs={fromTs} toTs={toTs} formatter="0.000$"/>

        </div>
    }
}
