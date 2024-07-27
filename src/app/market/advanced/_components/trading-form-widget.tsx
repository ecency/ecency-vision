import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React, { useEffect, useState } from "react";
import { Button } from "@ui/button";
import { DayChange } from "@/app/market/advanced/_advanced-mode/types/day-change.type";
import { Widget } from "@/app/market/advanced/_advanced-mode/types/layout.type";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import Link from "next/link";
import { HiveBarter } from "@/app/market/_components/hive-barter";

interface Props {
  buyBalance: string;
  sellBalance: string;
  dayChange: DayChange;
  price: number;
  amount: number;
  widgetTypeChanged: (type: Widget) => void;
  onSuccessTrade: () => void;
}

export const TradingFormWidget = ({
  buyBalance,
  sellBalance,
  dayChange,
  price,
  widgetTypeChanged,
  amount,
  onSuccessTrade
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const isMobile = useGlobalStore((s) => s.isMobile);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);

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
      className="market-advanced-mode-tf-widget"
      title={
        isMobile ? (
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
          i18next.t("market.advanced.form")
        )
      }
      widgetTypeChanged={widgetTypeChanged}
    >
      <div>
        {activeUser ? (
          <div className="market-advanced-mode-trading-form-widget flex">
            {activeTab === "buy" || !isMobile ? (
              <HiveBarter
                prefilledAmount={amount}
                isInline={true}
                type={1}
                available={buyBalance}
                username={activeUser.username}
                peakValue={buyPeakValue}
                basePeakValue={dayChange.low}
                loading={loading}
                onClickPeakValue={(v) => {
                  setBuyPeakValue(+v);
                }}
                onTransactionSuccess={() => onSuccessTrade()}
              />
            ) : (
              <></>
            )}
            {activeTab === "sell" || !isMobile ? (
              <HiveBarter
                prefilledAmount={amount}
                isInline={true}
                type={2}
                available={sellBalance}
                username={activeUser.username}
                peakValue={sellPeakValue}
                basePeakValue={dayChange.high}
                loading={loading}
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
            <div className="auth-required flex justify-center items-center flex-col">
              <div className="font-bold mb-3">{i18next.t("market.auth-required-title")}</div>
              <div className="mb-3">{i18next.t("market.advanced.trading-form-auth-required")}</div>
              <div className="flex">
                <Button outline={true} className="mr-2" onClick={() => toggleUIProp("login")}>
                  {i18next.t("g.login")}
                </Button>
                <Link href="/signup">
                  <Button>{i18next.t("g.signup")}</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </MarketAdvancedModeWidget>
  );
};
