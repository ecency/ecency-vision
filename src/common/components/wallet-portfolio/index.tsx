import React from "react";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import BaseComponent from "../base";
import HiveEngineToken from "../../helper/hive-engine-wallet";
import LinearProgress from "../linear-progress";
import HiveWallet from "../../helper/hive-wallet";

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
import { WalletPortfolioChart } from "../wallet-portfolio-chart";

const hbdIcom = require("./asset/hbd.png")

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  account: Account;
  history: History;
  updateActiveUser: (data?: Account) => void;
  updateWalletValues: () => void;
}

interface State {
  tokens: HiveEngineToken[];
  loading: boolean;
  assetBalance: number;
  allTokens: any;
  converting: number;
  coingeckoData: any;
}

export class WalletPortfolio extends BaseComponent<Props, State> {
  state: State = {
    tokens: [],
    loading: true,
    assetBalance: 0,
    allTokens: null,
    converting: 0,
    coingeckoData: []
  };
  _isMounted = false;
  pricePerHive = this.props.dynamicProps.base / this.props.dynamicProps.quote;

  componentDidMount() {    
    this._isMounted = true;
    this._isMounted && this.engineTokensData();
    this._isMounted && this.dataFromCoinGecko();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

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

    handleLink (symbol:string) {
      this.props.history.push(`portfolio/${symbol.toLowerCase()}`)
    }

  render() {
    const { global, dynamicProps, account } = this.props;
    const { allTokens, converting, coingeckoData } = this.state;
    // console.log(coingeckoData[0])
    const { hivePerMVests } = dynamicProps;
    const w = new HiveWallet(account, dynamicProps, converting);
    // console.log(w)

    const totalHP: any = formattedNumber(vestsToHp(w.vestingShares, hivePerMVests));
   
    return (
      <div className="wallet-hive-engine cursor-pointer">
          <div className="d-flex justify-content-center">
            <span>Total wallet Value: $1.19</span>
          </div>
        <div className="wallet-main mt-3">
        <table className="table">
          <thead>
            <tr>                
              <th>Token Name</th>
              {!global?.isMobile && 
              <th >Price</th>}
              <th >% Change</th>
              {!global?.isMobile &&
              <th >Trend</th>
              }
              <th>Balance</th>
              <th >Value</th>
            </tr>
          </thead>
          <tbody>
              <>
                <tr onClick={() => this.handleLink("hive")}>
                  <td className="align-middle">
                  <img src={coingeckoData[0]?.image} className="item-image"/>
                    <span>HIVE</span>                    
                  </td>
                  <td className="align-middle">${this.pricePerHive}</td>
                  <td className={`align-middle ${coingeckoData[0]?.price_change_percentage_24h < 0 ? "text-danger" : "text-success"}`}>
                      <span className="mr-1">
                        {coingeckoData[0]?.price_change_percentage_24h < 0 ? priceDownSvg : priceUpSvg}
                      </span>
                    {coingeckoData[0]?.price_change_percentage_24h}
                  </td>
                  <td className="align-middle">
                    <WalletPortfolioChart coinData={coingeckoData} />
                  </td>
                  <td className="align-middle">{w.balance}</td>
                  <td className="align-middle">${Number(w.balance * this.pricePerHive).toFixed(3)}</td>
                </tr>
                <tr onClick={() => this.handleLink("hive-power")}>
                  <td className="align-middle">
                  <img src={coingeckoData[0]?.image} className="item-image"/>
                    <span>HIVE-POWER</span>   
                  </td>
                  <td className="align-middle">${this.pricePerHive}</td>
                  <td className={`align-middle ${coingeckoData[0]?.price_change_percentage_24h < 0 ? "text-danger" : "text-success"}`}>
                      <span className="mr-1">
                        {coingeckoData[0]?.price_change_percentage_24h < 0 ? priceDownSvg : priceUpSvg}
                      </span>
                    {coingeckoData[0]?.price_change_percentage_24h}
                  </td>
                  <td className="align-middle">
                    <WalletPortfolioChart coinData={coingeckoData} />
                  </td>
                  <td className="align-middle">{totalHP}</td>
                  <td className="align-middle">${Number(totalHP * this.pricePerHive).toFixed(3)}</td>
                </tr>
                <tr onClick={() => this.handleLink("hbd")}>
                  <td className="align-middle">
                  <img src={hbdIcom} className="item-image"/>
                  <span>HBD</span>
                  </td>
                  <td className="align-middle">${coingeckoData[1]?.current_price}</td>
                  <td className={`align-middle ${coingeckoData[1]?.price_change_percentage_24h < 0 ? "text-danger" : "text-success"}`}>
                    <span className="mr-1">
                        {coingeckoData[1]?.price_change_percentage_24h < 0 ? priceDownSvg : priceUpSvg}
                      </span>
                    {coingeckoData[1]?.price_change_percentage_24h}
                  </td>
                  <td className="align-middle">
                    HBD-CHART
                  </td>
                  <td className="align-middle">{w.hbdBalance}</td>
                  <td className="align-middle">${Number(w.hbdBalance * coingeckoData[1]?.current_price).toFixed(3)}</td>
                </tr>
          {allTokens?.map((a: any) =>{
            const changeValue = parseFloat(a?.priceChangePercent);
            return(
              <tr key={a.symbol} className="table-link" onClick={() => this.handleLink(a.symbol)}>
                  <td className="align-middle">
                    <img src={a.icon} className="item-image"/>
                      <span>{a.symbol}</span>
                  </td>
                 {!global?.isMobile && <td className="align-middle">
                    <span>${a.lastPrice}</span>
                  </td>}
                  <td className="align-middle">                              
                     <span className={`${changeValue < 0 ? "text-danger" : "text-success"}`}
                     >
                       {a?.symbol === a.symbol && (
                         <span className="mr-1">
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
    // // activeUser: p.activeUser,
    // transactions: p.transactions,
    // // signingKey: p.signingKey,
    // // addAccount: p.addAccount,
    updateActiveUser: p.updateActiveUser,
    // // setSigningKey: p.setSigningKey,
    updateWalletValues: p.updateWalletValues,
    // // fetchPoints: p.fetchPoints,
    history: p.history
  };

  return <WalletPortfolio {...props} />;
};
