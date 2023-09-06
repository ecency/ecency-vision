import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React, { useEffect, useState } from "react";
import { _t } from "../../i18n";
import { HiveBarter } from "../hive-barter";
import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import { DayChange } from "../../pages/market/advanced-mode/types/day-change.type";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";
import { Link } from "react-router-dom";
import { ToggleType } from "../../store/ui/types";
import { Button } from "@ui/button";

interface Props {
  history: History;
  activeUser: ActiveUser | null;
  buyBalance: string;
  sellBalance: string;
  dayChange: DayChange;
  global: Global;
  price: number;
  amount: number;
  widgetTypeChanged: (type: Widget) => void;
  toggleUIProp: (value: ToggleType) => void;
  onSuccessTrade: () => void;
}

export const TradingFormWidget = ({
  activeUser,
  buyBalance,
  sellBalance,
  dayChange,
  global,
  price,
  history,
  widgetTypeChanged,
  toggleUIProp,
  amount,
  onSuccessTrade
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [buyPeakValue, setBuyPeakValue] = useState(0);
  const [sellPeakValue, setSellPeakValue] = useState(0);
  const [activeTab, setActiveTab] = useState("buy");

  useEffect(() => {
    setBuyPeakValue(price);
    setSellPeakValue(price);
  }, [price]);

  return (
    <MarketAdvancedModeWidget
      type={Widget.TradingForm}
      history={history}
      className="market-advanced-mode-tf-widget"
      title={
        global.isMobile ? (
          <div className="market-advanced-mode-oo-widget-tabs">
            <div
              className={
                "market-advanced-mode-oo-widget-tab " + (activeTab === "buy" ? "active" : "")
              }
              onClick={() => setActiveTab("buy")}
            >
              Buy
            </div>
            <div
              className={
                "market-advanced-mode-oo-widget-tab " + (activeTab === "sell" ? "active" : "")
              }
              onClick={() => setActiveTab("sell")}
            >
              Sell
            </div>
          </div>
        ) : (
          _t("market.advanced.form")
        )
      }
      children={
        <div>
          {activeUser ? (
            <div className="market-advanced-mode-trading-form-widget d-flex">
              {activeTab === "buy" || !global.isMobile ? (
                <HiveBarter
                  prefilledAmount={amount}
                  isInline={true}
                  type={1}
                  available={buyBalance}
                  username={activeUser.username}
                  peakValue={buyPeakValue}
                  basePeakValue={dayChange.low}
                  loading={loading}
                  activeUser={activeUser}
                  global={global}
                  onClickPeakValue={(v) => {
                    setBuyPeakValue(+v);
                  }}
                  onTransactionSuccess={() => onSuccessTrade()}
                />
              ) : (
                <></>
              )}
              {activeTab === "sell" || !global.isMobile ? (
                <HiveBarter
                  prefilledAmount={amount}
                  isInline={true}
                  type={2}
                  available={sellBalance}
                  username={activeUser.username}
                  peakValue={sellPeakValue}
                  basePeakValue={dayChange.high}
                  loading={loading}
                  activeUser={activeUser}
                  global={global}
                  onClickPeakValue={(v) => {
                    setSellPeakValue(+v);
                  }}
                  onTransactionSuccess={() => onSuccessTrade()}
                />
              ) : (
                <></>
              )}
            </div>
          ) : (
            <div className="market-advanced-mode-trading-form-login-required-widget">
              <div className="auth-required d-flex justify-content-center align-items-center flex-column">
                <div className="font-weight-bold mb-3">{_t("market.auth-required-title")}</div>
                <div className="mb-3">{_t("market.advanced.trading-form-auth-required")}</div>
                <div className="d-flex">
                  <Button outline={true} className="mr-2" onClick={() => toggleUIProp("login")}>
                    {_t("g.login")}
                  </Button>
                  <Link to="/signup">
                    <Button>{_t("g.signup")}</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      }
      widgetTypeChanged={widgetTypeChanged}
    />
  );
};
