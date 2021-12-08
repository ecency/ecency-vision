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
import { appleSvg, desktopSvg, eyeBoldSvg, googleSvg } from "../../img/svg";
import { Link } from "react-router-dom";
import DownloadTrigger from "../download-trigger";

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
    prices: Price[];
}

export class Market extends BaseComponent<Props, State> {
    state: State = {
        prices: [],
    }

    node = React.createRef<HTMLDivElement>();

    componentDidMount() {
        const {coin, vsCurrency, fromTs, toTs} = this.props;
        this._mounted = true;

        getMarketData(coin, vsCurrency, fromTs, toTs).then((r) => {
            if (r && r.prices && this._mounted) {
                const prices: Price[] = r.prices.map((x: any) => ({time: x[0], price: x[1]}));
                this.stateSet({prices}, () => {
                    this.attachEvents();
                });
            }
        }).catch(err=> console.log('market_data_error', err));
    }

    componentWillUnmount() {
        this._mounted = false;

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

interface MarketDataState {
    visible: boolean
}

export default class MarketData extends Component<{},MarketDataState> {
    constructor(props:{}){
        super(props);
        this.state = {
            visible: false
        }

    }

    render() {
        const fromTs = moment().subtract(2, "days").format("X");
        const toTs = moment().format("X");
        const {visible} = this.state;

        return <div className="market-data">
            <div className="market-data-header">
                <span className="title d-flex align-items-center">{_t("market-data.title")}
                {!visible && <div className="pointer ml-2" onClick={() => this.setState({visible:true})}>
                    {eyeBoldSvg}
                </div>}</span>
                {visible && <Tsx k="market-data.credits" args={{}}>
                    <div className="credits"/>
                </Tsx>}
            </div>
            {visible ? <>
                <Market label="HIVE" coin="hive" vsCurrency="usd" fromTs={fromTs} toTs={toTs} formatter="0.000$"/>
                <Market label="HBD" coin="hive_dollar" vsCurrency="usd" fromTs={fromTs} toTs={toTs} formatter="0.000$"/>
                <Market label="BTC" coin="bitcoin" vsCurrency="usd" fromTs={fromTs} toTs={toTs} formatter=",$"/>
                <Market label="ETH" coin="ethereum" vsCurrency="usd" fromTs={fromTs} toTs={toTs} formatter="0.000$"/>
                <div className="menu-nav">
                    <DownloadTrigger>
                        <div className="downloads">
                            <span className="label">{_t("g.downloads")}</span>
                            <span className="icons">
                                <span className="img-apple">{appleSvg}</span>
                                <span className="img-google">{googleSvg}</span>
                                <span className="img-desktop">{desktopSvg}</span>
                            </span>
                        </div>
                    </DownloadTrigger>

                    <div className="text-menu">
                        <Link className="menu-item" to="/faq">
                            {_t("entry-index.faq")}
                        </Link>
                        <Link className="menu-item" to="/terms-of-service">
                            {_t("entry-index.tos")}
                        </Link>
                        <Link className="menu-item" to="/privacy-policy">
                            {_t("entry-index.pp")}
                        </Link>
                    </div>
                </div>
                               
            </> : <div className="p-3 border-left">
                <div>
                <Link to="/faqs">FAQ</Link></div>
                <div className="my-3">
                <Link to="/faqs">Terms of service</Link></div>
                <div>
                <Link to="/faqs">Privacy Policy</Link></div>
                </div>}
        </div>
    }
}
