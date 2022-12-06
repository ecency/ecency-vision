import React, { useEffect, useState } from "react";
import { getOpenOrder, OpenOrdersData } from "../../api/hive";
import { OpenOrders } from "../open-orders";
import { ActiveUser } from "../../store/active-user/types";
import { _t } from "../../i18n";
import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";

interface Props {
  activeUser: ActiveUser | null;
  history: History;
}

export const OpenOrdersWidget = ({ activeUser, history }: Props) => {
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
      title={_t("market.advanced.open-orders")}
      children={
        <OpenOrders
          onTransactionSuccess={updateOpenData}
          data={openOrdersData || []}
          loading={openOrdersDataLoading}
          username={(activeUser && activeUser.username) || ""}
          activeUser={activeUser!}
          compat={true}
        />
      }
      widgetTypeChanged={() => {}}
    />
  );
};
