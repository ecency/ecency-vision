import React, { useEffect, useState } from "react";
import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { MarketAdvancedModeOrdersTable } from "./market-advanced-mode-orders-table";
import { Button } from "@ui/button";
import { Widget } from "@/app/market/advanced/_advanced-mode/types/layout.type";
import { LimitOrderCreate, OpenOrdersData, Transaction } from "@/entities";
import { PREFIX } from "@/utils/local-storage";
import i18next from "i18next";
import { OpenOrders } from "@/app/market/_components/open-orders";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";
import { getOpenOrdersQuery } from "@/api/queries";

interface Props {
  widgetTypeChanged: (type: Widget) => void;
  openOrdersData: OpenOrdersData[];
  setRefresh: (value: boolean) => void;
  allOrders: Transaction[];
}

type TabType = "open" | "completed" | "all";

export const OpenOrdersWidget = ({
  widgetTypeChanged,
  openOrdersData,
  setRefresh,
  allOrders
}: Props) => {
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [storedType, setStoredType] = useLocalStorage<TabType>(PREFIX + "_amm_oo_t", "open");
  const [type, setType] = useState<TabType>(storedType ?? "open");
  const [completedOrders, setCompletedOrders] = useState<LimitOrderCreate[]>([]);

  const { isLoading: openOrdersDataLoading } = getOpenOrdersQuery(
    activeUser?.username ?? ""
  ).useClientQuery();

  useEffect(() => {
    setCompletedOrders(
      (allOrders as LimitOrderCreate[]).filter(
        (order) => !openOrdersData.some((oo) => oo.orderid === order.orderid)
      )
    );
  }, [allOrders, openOrdersData]);

  const tabs: [TabType, string][] = [
    ["open", i18next.t("market.advanced.open-orders")],
    ["completed", i18next.t("market.advanced.completed-orders")],
    ["all", i18next.t("market.advanced.all-orders")]
  ];

  const getOpenOrders = () =>
    openOrdersData.length > 0 ? (
      <OpenOrders
        onTransactionSuccess={() => setRefresh(true)}
        data={openOrdersData || []}
        loading={openOrdersDataLoading}
        username={(activeUser && activeUser.username) || ""}
        compat={true}
        rounded={false}
      />
    ) : (
      <div className="market-advanced-mode-trading-form-login-required-widget">
        <div className="auth-required flex justify-center items-center flex-col">
          <div className="font-bold mb-3">{i18next.t("market.advanced.empty-open-orders")}</div>
        </div>
      </div>
    );

  const getAllOrders = () =>
    allOrders.length > 0 ? (
      <MarketAdvancedModeOrdersTable data={allOrders as any} openOrdersData={openOrdersData} />
    ) : (
      <div className="market-advanced-mode-trading-form-login-required-widget">
        <div className="auth-required flex justify-center items-center flex-col">
          <div className="font-bold mb-3">{i18next.t("market.advanced.empty-open-orders")}</div>
        </div>
      </div>
    );

  const getCompletedOrders = () =>
    completedOrders.length > 0 ? (
      <MarketAdvancedModeOrdersTable data={completedOrders} openOrdersData={openOrdersData} />
    ) : (
      <div className="market-advanced-mode-trading-form-login-required-widget">
        <div className="auth-required flex justify-center items-center flex-col">
          <div className="font-bold mb-3">{i18next.t("market.advanced.empty-open-orders")}</div>
        </div>
      </div>
    );

  return (
    <MarketAdvancedModeWidget
      type={Widget.OpenOrders}
      className="market-advanced-mode-oo-widget"
      title={
        <div className="market-advanced-mode-oo-widget-tabs">
          {tabs.map(([value, title]) => (
            <div
              key={value}
              className={
                "market-advanced-mode-oo-widget-tab cursor-pointer " +
                (value === type ? "active" : "")
              }
              onClick={() => {
                setType(value);
                setStoredType(value);
              }}
            >
              {title}
            </div>
          ))}
        </div>
      }
      widgetTypeChanged={widgetTypeChanged}
    >
      {activeUser ? (
        <div className="market-advanced-mode-oo-content">
          {type === "open" ? getOpenOrders() : null}
          {type === "completed" ? getCompletedOrders() : null}
          {type === "all" ? getAllOrders() : null}
        </div>
      ) : (
        <div className="market-advanced-mode-trading-form-login-required-widget">
          <div className="auth-required flex justify-center items-center flex-col">
            <div className="font-bold mb-3">{i18next.t("market.auth-required-title")}</div>
            <div className="mb-3">{i18next.t("market.advanced.open-orders-auth-required")}</div>
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
    </MarketAdvancedModeWidget>
  );
};
