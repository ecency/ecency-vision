import React from "react";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import BaseComponent from "../base";
import HiveEngineToken from "../../helper/hive-engine-wallet";
import LinearProgress from "../linear-progress";
import HiveWallet from "../../helper/hive-wallet";
import { Points } from "../../store/points/types";


import {
  getHiveEngineTokenBalances,
  getMetrics
} from "../../api/hive-engine";

import {
  priceUpSvg,
  priceDownSvg
} from "../../img/svg";

import formattedNumber from "../../util/formatted-number";
import { _t } from "../../i18n";
import { HiveEngineChart } from "../hive-engine-chart";
import { History } from "history";
import { vestsToHp } from "../../helper/vesting";
import { marketInfo, } from "../../api/misc";
import { HiveWalletPortfolioChart, HbdWalletPortfolioChart } from "../wallet-portfolio-chart";
import { getCurrencyTokenRate } from "../../api/private-api";

const hbdIcom = require("./asset/hbd.png")
const ecencyIcon = require("./asset/ecency.jpeg")

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  account: Account;
  history: History;
  updateActiveUser: (data?: Account) => void;
  updateWalletValues: () => void;
  points: Points;
}

interface State {
  tokens: HiveEngineToken[];
  loading: boolean;
  assetBalance: number;
  allTokens: any;
  converting: number;
  coingeckoData: any;
  estimatedPointsValue: number;
  estimatedPointsValueLoading: boolean;
}

export class WalletPortfolio extends BaseComponent<Props, State> {
  state: State = {
    tokens: [],
    loading: true,
    assetBalance: 0,
    allTokens: null,
    converting: 0,
    coingeckoData: [],
    estimatedPointsValue: 0,
    estimatedPointsValueLoading: false
  };
  _isMounted = false;
  pricePerHive = this.props.dynamicProps.base / this.props.dynamicProps.quote;

  componentDidMount() {    
    
    this._isMounted = true;
    this._isMounted && this.engineTokensData();
    this._isMounted && this.dataFromCoinGecko();
    this._isMounted && this.getEstimatedPointsValue();
  }

  componentWillUnmount() {
    this._isMounted = false;
  };

  dataFromCoinGecko = async () => {
    const data = await marketInfo();
    // console.log(data)
    this.setState({coingeckoData: data})
  }

  engineTokensData = async () => {
    const allMarketTokens = await getMetrics();
    const { account } = this.props;

    const userTokens: any = await getHiveEngineTokenBalances(account.name);

    let balanceMetrics: any = userTokens?.map((item: any) => {
      let eachMetric = allMarketTokens?.find((m: any) => m?.symbol === item?.symbol);
      return {
        ...item,
        ...eachMetric
      };
    });
    let tokensUsdValues: any = balanceMetrics?.map((w: any) => {
      const usd_value =
        w?.symbol === "SWAP.HIVE"
          ? Number(this.pricePerHive * w.balance)
          : w?.lastPrice === 0
          ? 0
          : Number(w?.lastPrice * this.pricePerHive * w?.balance).toFixed(10);
      return {
        ...w,
        usd_value
      };
    });
    this.setState({ allTokens: tokensUsdValues });
    return tokensUsdValues;
  };

  getEstimatedPointsValue = () => {
    const {
      global: { currency }
    } = this.props;
    this.setState({estimatedPointsValueLoading: true});
    getCurrencyTokenRate(currency, "estm")
      .then((res) => {
        this.setState({estimatedPointsValue: res});
        this.setState({estimatedPointsValueLoading: false});
      })
      .catch((error) => {
        console.log(error)
        this.setState({estimatedPointsValueLoading: false});
        this.setState({estimatedPointsValue: 0});
      });
  };

    handleLink (symbol:string) {
      this.props.history.push(`portfolio/${symbol.toLowerCase()}`)
    }

  render() {
    const { global, dynamicProps, account, points } = this.props;
    const { allTokens, converting, coingeckoData, estimatedPointsValue } = this.state;
    // console.log(estimatedPointsValue)
    const { hivePerMVests } = dynamicProps;
    const w = new HiveWallet(account, dynamicProps, converting);

    const totalHP: any = formattedNumber(vestsToHp(w.vestingShares, hivePerMVests));
   
    return (
      <div className="wallet-hive-engine">
          <div className="d-flex justify-content-center">
            <span>Total wallet Value: $1.19</span>
          </div>
        <div className="wallet-main mt-3">
        <table className="table">
          <thead>
            <tr>                
              <th>{_t("wallet-portfolio.name")}</th>
              {!global?.isMobile && 
              <th>{_t("wallet-portfolio.price")}</th>}
              <th>{_t("wallet-portfolio.change")}</th>
              {!global?.isMobile &&
              <th >{_t("wallet-portfolio.trend")}</th>
              }
              <th>{_t("wallet-portfolio.balance")}</th>
              <th >{_t("wallet-portfolio.value")}</th>
            </tr>
          </thead>
          <tbody>
              <>
                <tr className="table-row" onClick={() => this.handleLink("points")}>
                  <td className="align-middle">
                  <img src={ecencyIcon} className="item-image"/>
                    <span>ECENCY POINT</span>                    
                  </td>
                  <td className="align-middle">${estimatedPointsValue}</td>
                  <td className="align-middle">
                    -------------------
                  </td>
                  <td className="align-middle">
                    -------------------
                  </td>
                  <td className="align-middle">{points.points}</td>
                  <td className="align-middle">${Number(estimatedPointsValue * Number(points.points)).toFixed(3)}</td>
                </tr>

                <tr className="table-row" onClick={() => this.handleLink("hive")}>
                  <td className="align-middle">
                  <img src={coingeckoData[0]?.image} className="item-image"/>
                    <span>HIVE</span>                    
                  </td>
                  <td className="align-middle">${this.pricePerHive}</td>
                  <td className={`align-middle ${coingeckoData[0]?.price_change_percentage_24h < 0 ? "text-danger" : "text-success"}`}>
                      <span>
                        {coingeckoData[0]?.price_change_percentage_24h < 0 ? priceDownSvg : priceUpSvg}
                      </span>
                    {coingeckoData[0]?.price_change_percentage_24h}
                  </td>
                  <td className="align-middle">
                    <HiveWalletPortfolioChart coinData={coingeckoData} />
                  </td>
                  <td className="align-middle">{w.balance}</td>
                  <td className="align-middle">${Number(w.balance * this.pricePerHive).toFixed(3)}</td>
                </tr>

                <tr className="table-row" onClick={() => this.handleLink("hive-power")}>
                  <td className="align-middle">
                  <img src={coingeckoData[0]?.image} className="item-image"/>
                    <span>HIVE-POWER</span>   
                  </td>
                  <td className="align-middle">${this.pricePerHive}</td>
                  <td className={`align-middle ${coingeckoData[0]?.price_change_percentage_24h < 0 ? "text-danger" : "text-success"}`}>
                      <span>
                        {coingeckoData[0]?.price_change_percentage_24h < 0 ? priceDownSvg : priceUpSvg}
                      </span>
                    {coingeckoData[0]?.price_change_percentage_24h}
                  </td>
                  <td className="align-middle">
                    -------------------
                  </td>
                  <td className="align-middle">{totalHP}</td>
                  <td className="align-middle">${Number(totalHP * this.pricePerHive).toFixed(3)}</td>
                </tr>

                <tr className="table-row" onClick={() => this.handleLink("hbd")}>
                  <td className="align-middle">
                  <img src={hbdIcom} className="item-image"/>
                  <span>HBD</span>
                  </td>
                  <td className="align-middle">${coingeckoData[1]?.current_price}</td>
                  <td className={`align-middle ${coingeckoData[1]?.price_change_percentage_24h < 0 ? "text-danger" : "text-success"}`}>
                    <span>
                        {coingeckoData[1]?.price_change_percentage_24h < 0 ? priceDownSvg : priceUpSvg}
                      </span>
                    {coingeckoData[1]?.price_change_percentage_24h}
                  </td>
                  <td className="align-middle">
                    <HbdWalletPortfolioChart />
                  </td>
                  <td className="align-middle">{w.hbdBalance}</td>
                  <td className="align-middle">${Number(w.hbdBalance * coingeckoData[1]?.current_price).toFixed(3)}</td>
                </tr>

          {allTokens?.map((a: any) =>{
            const changeValue = parseFloat(a?.priceChangePercent);
            return(
              <tr className="table-row" key={a.symbol} onClick={() => this.handleLink(a.symbol)}>
                  <td className="align-middle">
                    <span className="new-feature">                      
                      <img src={a.icon} className="item-image"/>
                    </span>
                      <span>{a.symbol}</span>
                  </td>
                 {!global?.isMobile && <td className="align-middle">
                    <span>${a.lastPrice}</span>
                  </td>}
                  <td className="align-middle">                              
                     <span className={`${changeValue < 0 ? "text-danger" : "text-success"}`}
                     >
                       {a?.symbol === a.symbol && (
                         <span>
                           {changeValue < 0 ? priceDownSvg : priceUpSvg}
                         </span>
                       )}
                       {a?.symbol === a.symbol ? a?.priceChangePercent : null}
                     </span>
                  </td>
                  {!global?.isMobile && <td className="align-middle">
                      <span>
                          <div>
                            <HiveEngineChart items={a} />
                          </div>
                      </span>
                  </td>}
                  <td className="align-middle">
                    <span>{a.balance}</span>
                  </td>
                  <td className="align-middle">
                    <span>${a.usd_value}</span>
                  </td>
                </tr>
                    )
                })}
              </>
          </tbody>
        </table>
        </div>
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    global: p.global,
    dynamicProps: p.dynamicProps,
    account: p.account,
    updateActiveUser: p.updateActiveUser,
    updateWalletValues: p.updateWalletValues,
    history: p.history,
    points: p.points,
  };

  return <WalletPortfolio {...props} />;
};
