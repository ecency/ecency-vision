import React, { useEffect, useState } from "react";
import { getOpenOrder, OpenOrdersData } from "../../api/hive";
import { OpenOrders } from "../open-orders";
import { ActiveUser } from "../../store/active-user/types";
import { _t } from "../../i18n";
import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ToggleType } from "../../store/ui/types";

interface Props {
  activeUser: ActiveUser | null;
  history: History;
  widgetTypeChanged: (type: Widget) => void;
  toggleUIProp: (when: ToggleType) => void;
}

export const OpenOrdersWidget = ({
  activeUser,
  history,
  widgetTypeChanged,
  toggleUIProp
}: Props) => {
  const [openOrdersData, setOpenOrdersData] = useState<OpenOrdersData[]>([]);
  const [openOrdersDataLoading, setOpenOrdersDataLoading] = useState(false);

  useEffect(() => {
    updateOpenData();
  }, []);

  const updateOpenData = () => {
    if (activeUser) {
      setOpenOrdersDataLoading(true);
      getOpenOrder(activeUser.username).then((res) => {
        setOpenOrdersData(res);
        setOpenOrdersDataLoading(false);
      });
    }
  };

  return (
    <MarketAdvancedModeWidget
      history={history}
      type={Widget.OpenOrders}
      className="market-advanced-mode-oo-widget"
      title={_t("market.advanced.open-orders")}
      children={
        activeUser ? (
          openOrdersData.length > 0 ? (
            <OpenOrders
              onTransactionSuccess={updateOpenData}
              data={openOrdersData || []}
              loading={openOrdersDataLoading}
              username={(activeUser && activeUser.username) || ""}
              activeUser={activeUser!}
              compat={true}
            />
          ) : (
            <div className="market-advanced-mode-trading-form-login-required-widget">
              <div className="auth-required d-flex justify-content-center align-items-center flex-column">
                <div className="font-weight-bold mb-3">
                  {_t("market.advanced.empty-open-orders")}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="market-advanced-mode-trading-form-login-required-widget">
            <div className="auth-required d-flex justify-content-center align-items-center flex-column">
              <div className="font-weight-bold mb-3">{_t("market.auth-required-title")}</div>
              <div className="mb-3">{_t("market.advanced.open-orders-auth-required")}</div>
              <div className="d-flex">
                <Button
                  variant="outline-primary"
                  className="mr-2"
                  onClick={() => toggleUIProp("login")}
                >
                  {_t("g.login")}
                </Button>
                <Link to="/signup">
                  <Button variant="primary">{_t("g.signup")}</Button>
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
