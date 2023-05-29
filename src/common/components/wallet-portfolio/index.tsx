import React from "react";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import HiveEngineToken from "../../helper/hive-engine-wallet";
import LinearProgress from "../linear-progress";
import HiveWallet from "../../helper/hive-wallet";
import { Points } from "../../store/points/types";

import { getHiveEngineTokenBalances, getMetrics } from "../../api/hive-engine";

import { priceUpSvg, priceDownSvg, plusCircle } from "../../img/svg";

import formattedNumber from "../../util/formatted-number";
import { _t } from "../../i18n";
import { HiveEngineChart } from "../hive-engine-chart";
import { History } from "history";
import { vestsToHp } from "../../helper/vesting";
import { marketInfo } from "../../api/misc";
import {
  HiveWalletPortfolioChart,
  HbdWalletPortfolioChart,
  DefaultPortfolioChart
} from "../wallet-portfolio-chart";
import { getCurrencyTokenRate } from "../../api/private-api";
import EngineTokensList from "../engine-tokens-list";
import { Button, FormControl, Modal } from "react-bootstrap";
import { updateProfile } from "../../api/operations";
import { getSpkWallet, getMarketInfo, getLarynxData } from "../../api/spk-api";
import { findIndex } from "lodash";
import "./index.scss";
// Needs to keep the styles in order, can later be simplified or added to a single directory
import "../wallet-hive/_index.scss";
import "../wallet-ecency/_index.scss";
import "../wallet-hive-engine/_index.scss";
import "../wallet-spk/wallet-spk-delegated-power-dialog.scss";
import "../wallet-spk/wallet-spk-dialog.scss";

const hbdIcom = require("./asset/hbd.png");
const ecencyIcon = require("./asset/ecency.jpeg");
const spkIcon = require("./asset/spklogo.png");
const engineIcon = require("./asset/engine.png");

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  account: Account | any;
  activeUser: ActiveUser | null;
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
  search: string;
  showTokenList: boolean;
  favoriteTokens: HiveEngineToken[] | any;
  selectedTokens: HiveEngineToken[] | any;
  isChecked: boolean;
  tokenBalance: number;
  larynxTokenBalance: number;
  larynxPowerBalance: number;
  showChart: boolean;
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
    estimatedPointsValueLoading: false,
    search: "",
    showTokenList: false,
    favoriteTokens: [],
    selectedTokens: [],
    isChecked: false,
    tokenBalance: 0,
    larynxTokenBalance: 0,
    larynxPowerBalance: 0,
    showChart: false
  };
  _isMounted = false;
  pricePerHive = this.props.dynamicProps.base / this.props.dynamicProps.quote;

  componentDidMount() {
    this._isMounted = true;
    this._isMounted && this.engineTokensData();
    this._isMounted && this.dataFromCoinGecko();
    this._isMounted && this.getEstimatedPointsValue();
    this._isMounted && this.getSpkTokens();
    this._isMounted && this.setExistingProfileTokens();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  dataFromCoinGecko = async () => {
    const data = await marketInfo();
    this.setState({ coingeckoData: data });
  };

  engineTokensData = async () => {
    const allMarketTokens = await getMetrics();
    const spkTokens = await this.getSpkTokens();
    const { account } = this.props;

    const userTokens: any = await getHiveEngineTokenBalances(account.name);

    let balanceMetrics: any = userTokens?.map((item: any) => {
      let eachMetric = allMarketTokens?.find((m: any) => m?.symbol === item?.symbol);
      return {
        ...item,
        ...eachMetric,
        type: "Engine"
      };
    });

    let engineTokens: any = balanceMetrics?.map((w: any) => {
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
    this.setState({ allTokens: [...engineTokens, ...spkTokens] });
    // return engineTokens;
  };

  setExistingProfileTokens = () => {
    this._isMounted &&
      this.setState({
        selectedTokens: JSON.parse(this.props.account?.posting_json_metadata)?.profile?.profileTokens || []
      });
  }

  getEstimatedPointsValue = () => {
    const {
      global: { currency }
    } = this.props;
    this.setState({ estimatedPointsValueLoading: true });
    getCurrencyTokenRate(currency, "estm")
      .then((res) => {
        this.setState({ estimatedPointsValue: res });
        this.setState({ estimatedPointsValueLoading: false });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ estimatedPointsValueLoading: false });
        this.setState({ estimatedPointsValue: 0 });
      });
  };

  handleLink(symbol: string) {
    this.props.history.push(`wallet/${symbol.toLowerCase()}`);
  }

  hideList = () => {
    this.setState({ showTokenList: false });
  };

  showList = () => {
    this.setState({ showTokenList: true });
  };

  handleChange = (e: any, token: any) => {
    const { account } = this.props;
    const { selectedTokens, isChecked } = this.state;
    const json_data = JSON.parse(account.posting_json_metadata);
    let userProfile = json_data?.profile;
    let { profileTokens } = userProfile;
    const index = findIndex(profileTokens, (t: any) => t?.symbol === token?.symbol);

    if (index > -1) {
      profileTokens = profileTokens.filter((t: any) => t?.symbol !== token?.symbol);
    }


    this.setState((prevState) => {
      return {
        isChecked: e ? true : false,
        selectedTokens: !e
          ? selectedTokens.filter((t: any) => t?.symbol !== token?.symbol)
          : [...prevState?.selectedTokens, token],
      };
    });
  };

  addToProfile = async () => {
    const { account } = this.props;
    const { selectedTokens } = this.state;

    // const spkTokens = await this.getSpkTokens();
    const json_data = JSON.parse(account.posting_json_metadata);
    let userProfile = json_data?.profile;

    if (!userProfile.profileTokens) {
      userProfile.profileTokens = [];
    }

    const newPostMeta: any = {
      ...userProfile,
      profileTokens: mergeAndRemoveDuplicates([], selectedTokens),
    };

    //TODO: update UI state

    await updateProfile(account, newPostMeta);
  };

  getSpkTokens = async () => {
    const wallet = await getSpkWallet(this.props.account.name);
    const marketData = await getMarketInfo();
    const larynxData = await getLarynxData();
    const spkTokens = [
      {
        spk: wallet.spk / 1000,
        type: "Spk",
        name: "SPK",
        icon: spkIcon,
        symbol: "SPK"
      },
      {
        larynx: wallet.balance / 1000,
        type: "Spk",
        name: "LARYNX",
        icon: spkIcon,
        symbol: "LARYNX"
      },
      {
        lp: wallet.poweredUp / 1000,
        type: "Spk",
        name: "LP",
        icon: spkIcon,
        symbol: "LP"
      }
    ];

    this.setState({
      tokenBalance: wallet.spk / 1000,
      larynxTokenBalance: wallet.balance / 1000,
      larynxPowerBalance: wallet.poweredUp / 1000
    });
    return spkTokens;
  };

  toggleChart = (e: any) => {
    this.setState({ showChart: e.target.checked });
  };

  formatCurrency = (price: number | string) => {
    const formatted = price?.toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
    return formatted;
  };

  render() {
    const { global, dynamicProps, account, points, activeUser } = this.props;
    const {
      allTokens,
      converting,
      coingeckoData,
      estimatedPointsValue,
      search,
      showTokenList,
      isChecked,
      showChart,
      selectedTokens
    } = this.state;
    const { hivePerMVests } = dynamicProps;

    const profileTokens: any = [...selectedTokens] || [];
    const w = new HiveWallet(account, dynamicProps, converting);

    const totalHP: any = formattedNumber(vestsToHp(w.vestingShares, hivePerMVests));

    const profiletokenValues = profileTokens?.map((w: any) => {
      return w.symbol === "SWAP.HIVE"
        ? Number(this.pricePerHive * w.balance)
        : w.lastPrice === 0
        ? 0
        : Number(w.lastPrice * this.pricePerHive * w.balance);
    });

    const totalProfileTokensValue = profiletokenValues?.reduce((x: any, y: any) => {
      const totalValue = +(x + y).toFixed(3);
      return totalValue;
    }, 0);

    const totalHPValue = Number(totalHP * this.pricePerHive);
    const totalPointsValue = Number(estimatedPointsValue * Number(points.points));
    const totalHiveValue = Number(w.balance * this.pricePerHive);
    const totalHbdValue = Number(w.hbdBalance * coingeckoData[1]?.current_price);
    const estimatedTotal = Number(
      totalHPValue + totalHiveValue + totalPointsValue + totalHbdValue + totalProfileTokensValue
    );

    return (
      <div className="wallet-hive-engine">
        <div className="table-top d-flex">
          <span>
            {_t("wallet-portfolio.total-value")} {this.formatCurrency(estimatedTotal)}
          </span>
          <div className="toggle">
            <span className=" text-primary">{_t("wallet-portfolio.show-trend")}</span>
            <label className="toggle-chart">
              <input type="checkbox" checked={showChart} onChange={this.toggleChart} />
              <span className="switch" />
            </label>
          </div>
        </div>
        <div className="wallet-main mt-3">
          <table className="table">
            <thead>
              <tr>
                <th>{_t("wallet-portfolio.name")}</th>
                {!global?.isMobile && <th>{_t("wallet-portfolio.price")}</th>}
                <th>{_t("wallet-portfolio.change")}</th>
                {!global?.isMobile && showChart && <th>{_t("wallet-portfolio.trend")}</th>}
                <th>{_t("wallet-portfolio.balance")}</th>
                <th>{_t("wallet-portfolio.value")}</th>
              </tr>
            </thead>
            <tbody>
              <>
                <tr className="table-row" onClick={() => this.handleLink("points")}>
                  <td className="align-middle">
                    <img src={ecencyIcon} className="item-image" />
                    <span>{_t("wallet-portfolio.points")}</span>
                  </td>
                  <td className="align-middle">${estimatedPointsValue}</td>
                  <td className="align-middle text-success">{priceUpSvg}0.00%</td>
                  {!global?.isMobile && showChart && (
                    <td className="align-middle">
                      <DefaultPortfolioChart />
                    </td>
                  )}
                  <td className="align-middle">{points.points}</td>
                  <td className="align-middle">{this.formatCurrency(totalPointsValue)}</td>
                </tr>

                <tr className="table-row" onClick={() => this.handleLink("hive-power")}>
                  <td className="align-middle">
                    <img src={coingeckoData[0]?.image} className="item-image" />
                    <span>{_t("wallet-portfolio.hive-power")}</span>
                  </td>
                  <td className="align-middle">${this.pricePerHive}</td>
                  <td
                    className={`align-middle ${
                      coingeckoData[0]?.price_change_percentage_24h < 0
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    <span>
                      {coingeckoData[0]?.price_change_percentage_24h < 0
                        ? priceDownSvg
                        : priceUpSvg}
                    </span>
                    {coingeckoData[0]?.price_change_percentage_24h}
                  </td>
                  {!global?.isMobile && showChart && (
                    <td className="align-middle">
                      <DefaultPortfolioChart />
                    </td>
                  )}
                  <td className="align-middle">{totalHP}</td>
                  <td className="align-middle">{this.formatCurrency(totalHPValue)}</td>
                </tr>

                <tr className="table-row" onClick={() => this.handleLink("hive")}>
                  <td className="align-middle">
                    <img src={coingeckoData[0]?.image} className="item-image" />
                    <span>{_t("wallet-portfolio.hive")}</span>
                  </td>
                  <td className="align-middle">${this.pricePerHive}</td>
                  <td
                    className={`align-middle ${
                      coingeckoData[0]?.price_change_percentage_24h < 0
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    <span>
                      {coingeckoData[0]?.price_change_percentage_24h < 0
                        ? priceDownSvg
                        : priceUpSvg}
                    </span>
                    {coingeckoData[0]?.price_change_percentage_24h}
                  </td>
                  {!global?.isMobile && showChart && (
                    <td className="align-middle">
                      <HiveWalletPortfolioChart coinData={coingeckoData} />
                    </td>
                  )}
                  <td className="align-middle">{w.balance}</td>
                  <td className="align-middle">{this.formatCurrency(totalHiveValue)}</td>
                </tr>

                <tr className="table-row" onClick={() => this.handleLink("hbd")}>
                  <td className="align-middle">
                    <img src={hbdIcom} className="item-image" />
                    <span>{_t("wallet-portfolio.hbd")}</span>
                  </td>
                  <td className="align-middle">${coingeckoData[1]?.current_price}</td>
                  <td
                    className={`align-middle ${
                      coingeckoData[1]?.price_change_percentage_24h < 0
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    <span>
                      {coingeckoData[1]?.price_change_percentage_24h < 0
                        ? priceDownSvg
                        : priceUpSvg}
                    </span>
                    {coingeckoData[1]?.price_change_percentage_24h}
                  </td>
                  {!global?.isMobile && showChart && (
                    <td className="align-middle">
                      <HbdWalletPortfolioChart />
                    </td>
                  )}
                  <td className="align-middle">{w.hbdBalance}</td>
                  <td className="align-middle">{this.formatCurrency(totalHbdValue)}</td>
                </tr>

                {!profileTokens ? (
                  <LinearProgress />
                ) : (
                  profileTokens?.map((a: any) => {
                    const changeValue = parseFloat(a?.priceChangePercent);
                    return (
                      <tr
                        className="table-row"
                        key={a.symbol}
                        onClick={() => this.handleLink(a.symbol)}
                      >
                        <td className=" d-flex align-items-center">
                          <div className="token-image">
                            <img src={a.icon} className="item-image" />
                            <img
                              src={a.type === "Engine" ? engineIcon : spkIcon}
                              className="type-image"
                            />
                          </div>
                          <span>{a.symbol}</span>
                        </td>
                        {!global?.isMobile && (
                          <td className="align-middle">
                            <span>${a.lastPrice}</span>
                          </td>
                        )}
                        <td className="align-middle">
                          <span className={`${changeValue < 0 ? "text-danger" : "text-success"}`}>
                            {a?.symbol === a.symbol && (
                              <span>{changeValue < 0 ? priceDownSvg : priceUpSvg}</span>
                            )}
                            {a?.symbol === a.symbol ? a?.priceChangePercent : null}
                          </span>
                        </td>
                        {!global?.isMobile && showChart && (
                          <td className="align-middle">
                            <span>
                              <div>
                                <HiveEngineChart items={a} />
                              </div>
                            </span>
                          </td>
                        )}
                        <td className="align-middle">
                          <span>{a.balance}</span>
                        </td>
                        <td className="align-middle">
                          <span>{this.formatCurrency(a.usd_value)}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </>
            </tbody>
          </table>
        </div>
        {activeUser?.username === account.name && (
          <div className="d-flex justify-content-center">
            <Button className="p-2" onClick={this.showList}>
              Add Token {plusCircle}
            </Button>
          </div>
        )}
        {activeUser?.username === account.name && (
          <Modal
            onHide={this.hideList}
            show={showTokenList}
            centered={true}
            animation={false}
            // size="lg"
            scrollable
            style={{ height: "100vh" }}
          >
            <Modal.Header closeButton={true}>
              <Modal.Title>Tokens</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex flex-column">
                <div className="list-search-box d-flex justify-content-center mb-3">
                  <FormControl
                    value={search}
                    placeholder="search token"
                    onChange={(e) => this.setState({ search: e.target.value })}
                    style={{ width: "50%" }}
                  />
                </div>
                {allTokens
                  ?.slice(0, 30)
                  .filter(
                    (list: any) =>
                      list?.name.toLowerCase().startsWith(search) ||
                      list?.name.toLowerCase().includes(search)
                  )
                  .map((token: any, i: any) => {
                    const favoriteToken =
                      this.state.selectedTokens?.length > 0
                        ? [...this.state.selectedTokens, ...this.state.selectedTokens]?.find(
                            (favorite: any) => favorite.symbol === token.symbol
                          )
                        : [...profileTokens, ...this.state.selectedTokens]?.find(
                            (favorite: any) => favorite.symbol === token.symbol
                          );
                    return (
                      <EngineTokensList
                        token={token}
                        showTokenList={showTokenList}
                        handleChange={this.handleChange}
                        isChecked={isChecked}
                        key={i}
                        favoriteToken={favoriteToken}
                      />
                    );
                  })}
                <div className="confirm-btn align-self-center">
                  <Button
                    onClick={() => {
                      this.addToProfile();
                      this.hideList();
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        )}
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    global: p.global,
    dynamicProps: p.dynamicProps,
    account: p.account,
    activeUser: p.activeUser,
    updateActiveUser: p.updateActiveUser,
    updateWalletValues: p.updateWalletValues,
    history: p.history,
    points: p.points
  };

  return <WalletPortfolio {...props} />;
};

function mergeAndRemoveDuplicates(
  arr1: HiveEngineToken[],
  arr2: HiveEngineToken[]
): HiveEngineToken[] {
  const mergedArray: HiveEngineToken[] = arr1.concat(arr2);

  const uniqueArray: HiveEngineToken[] = mergedArray.reduce(
    (accumulator: HiveEngineToken[], current: HiveEngineToken) => {
      const key = JSON.stringify(current); // Convert the object to a string for the key

      const existingToken = accumulator.find((token) => JSON.stringify(token) === key);
      if (!existingToken) {
        accumulator.push(current);
      }

      return accumulator;
    },
    []
  );

  return uniqueArray;
}