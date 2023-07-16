import React, { Component } from "react";

import moment from "moment";

import { _t } from "../../i18n";

import { Tsx } from "../../i18n/helper";
import { appleSvg, desktopSvg, eyeBoldSvg, eyeSvg, googleSvg } from "../../img/svg";
import { Link } from "react-router-dom";
import DownloadTrigger from "../download-trigger";
import SSRSuspense from "../ssr-suspense";
import { Global } from "../../store/global/types";
import "./_index.scss";
const Market = React.lazy(() => import("./market"));

interface MarketDataProps {
  global: Global;
}

interface MarketDataState {
  visible: boolean;
}

export default class MarketData extends Component<MarketDataProps, MarketDataState> {
  constructor(props: MarketDataProps) {
    super(props);
    this.state = {
      visible: false
    };
  }

  render() {
    const fromTs = moment().subtract(2, "days").format("X");
    const toTs = moment().format("X");
    const { visible } = this.state;
    const {
      global: { theme }
    } = this.props;

    return (
      <div className="market-data">
        <div className="market-data-header">
          <span className="title d-flex align-items-center">
            {_t("market-data.title")}
            <div className="pointer ml-2" onClick={() => this.setState({ visible: !visible })}>
              {visible ? eyeSvg : eyeBoldSvg}
            </div>
          </span>
          {visible && (
            <Tsx k="market-data.credits" args={{}}>
              <div className="credits" />
            </Tsx>
          )}
        </div>
        {visible ? (
          <SSRSuspense fallback={_t("g.loading-chunk")}>
            <Market
              label="HIVE"
              coin="hive"
              vsCurrency="usd"
              fromTs={fromTs}
              toTs={toTs}
              formatter="0.000$"
              theme={theme}
            />
            <Market
              label="HBD"
              coin="hive_dollar"
              vsCurrency="usd"
              fromTs={fromTs}
              toTs={toTs}
              formatter="0.000$"
              theme={theme}
            />
            <Market
              label="BTC"
              coin="bitcoin"
              vsCurrency="usd"
              fromTs={fromTs}
              toTs={toTs}
              formatter=",$"
              theme={theme}
            />
            <Market
              label="ETH"
              coin="ethereum"
              vsCurrency="usd"
              fromTs={fromTs}
              toTs={toTs}
              formatter="0.000$"
              theme={theme}
            />
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
          </SSRSuspense>
        ) : (
          <div className="p-3 border-l border-[--border-color]">
            <div>
              <Link to="/faq">FAQ</Link>
            </div>
            <div className="my-3">
              <Link to="/terms-of-service">Terms of service</Link>
            </div>
            <div>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </div>
            <div className="mt-3">
              <Link to="/market">Market</Link>
            </div>
          </div>
        )}
      </div>
    );
  }
}
