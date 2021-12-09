import React, {Component} from "react";

import moment from "moment";

import {_t} from "../../i18n";

import {Tsx} from "../../i18n/helper";
import { appleSvg, desktopSvg, eyeBoldSvg, googleSvg } from "../../img/svg";
import { Link } from "react-router-dom";
import DownloadTrigger from "../download-trigger";
import SSRSuspense from "../ssr-suspense";
const Market = React.lazy(()=> import ("./market"));


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
            {visible ? <SSRSuspense fallback={'Loading chunked charts'}>
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
                               
            </SSRSuspense> : <div className="p-3 border-left">
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
