import React, { useEffect, useState } from "react";
import { OpenOrdersData } from "../../api/hive";
import { OpenOrders } from "../open-orders";
import { ActiveUser } from "../../store/active-user/types";
import { _t } from "../../i18n";
import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";
import { Link } from "react-router-dom";
import { ToggleType } from "../../store/ui/types";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../util/local-storage";
import { LimitOrderCreate, Transaction } from "../../store/transactions/types";
import { MarketAdvancedModeOrdersTable } from "./market-advanced-mode-orders-table";
import { Button } from "@ui/button";

interface Props {
  activeUser: ActiveUser | null;
  history: History;
  widgetTypeChanged: (type: Widget) => void;
  toggleUIProp: (when: ToggleType) => void;
  openOrdersData: OpenOrdersData[];
  openOrdersDataLoading: boolean;
  setRefresh: (value: boolean) => void;
  allOrders: Transaction[];
}

type TabType = "open" | "completed" | "all";

export const OpenOrdersWidget = ({
  activeUser,
  history,
  widgetTypeChanged,
  toggleUIProp,
  openOrdersData,
  openOrdersDataLoading,
  setRefresh,
  allOrders
}: Props) => {
  const [storedType, setStoredType] = useLocalStorage<TabType>(PREFIX + "_amm_oo_t", "open");
  const [type, setType] = useState<TabType>(storedType ?? "open");
  const [completedOrders, setCompletedOrders] = useState<LimitOrderCreate[]>([]);

  useEffect(() => {
    setCompletedOrders(
      (allOrders as LimitOrderCreate[]).filter(
        (order) => !openOrdersData.some((oo) => oo.orderid === order.orderid)
      )
    );
  }, [allOrders, openOrdersData]);

  const tabs: [TabType, string][] = [
    ["open", _t("market.advanced.open-orders")],
    ["completed", _t("market.advanced.completed-orders")],
    ["all", _t("market.advanced.all-orders")]
  ];

  const getOpenOrders = () =>
    openOrdersData.length > 0 ? (
      <OpenOrders
        onTransactionSuccess={() => setRefresh(true)}
        data={openOrdersData || []}
        loading={openOrdersDataLoading}
        username={(activeUser && activeUser.username) || ""}
        activeUser={activeUser!}
        compat={true}
      />
    ) : (
      <div className="market-advanced-mode-trading-form-login-required-widget">
        <div className="auth-required d-flex justify-content-center align-items-center flex-column">
          <div className="font-weight-bold mb-3">{_t("market.advanced.empty-open-orders")}</div>
        </div>
      </div>
    );

  const getAllOrders = () =>
    allOrders.length > 0 ? (
      <MarketAdvancedModeOrdersTable data={allOrders as any} openOrdersData={openOrdersData} />
    ) : (
      <div className="market-advanced-mode-trading-form-login-required-widget">
        <div className="auth-required d-flex justify-content-center align-items-center flex-column">
          <div className="font-weight-bold mb-3">{_t("market.advanced.empty-open-orders")}</div>
        </div>
      </div>
    );

  const getCompletedOrders = () =>
    completedOrders.length > 0 ? (
      <MarketAdvancedModeOrdersTable data={completedOrders} openOrdersData={openOrdersData} />
    ) : (
      <div className="market-advanced-mode-trading-form-login-required-widget">
        <div className="auth-required d-flex justify-content-center align-items-center flex-column">
          <div className="font-weight-bold mb-3">{_t("market.advanced.empty-open-orders")}</div>
        </div>
      </div>
    );

  return (
    <MarketAdvancedModeWidget
      history={history}
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
      children={
        activeUser ? (
          <div className="market-advanced-mode-oo-content">
            {type === "open" ? getOpenOrders() : null}
            {type === "completed" ? getCompletedOrders() : null}
            {type === "all" ? getAllOrders() : null}
          </div>
        ) : (
          <div className="market-advanced-mode-trading-form-login-required-widget">
            <div className="auth-required d-flex justify-content-center align-items-center flex-column">
              <div className="font-weight-bold mb-3">{_t("market.auth-required-title")}</div>
              <div className="mb-3">{_t("market.advanced.open-orders-auth-required")}</div>
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
        )
      }
      widgetTypeChanged={widgetTypeChanged}
    />
  );
};
