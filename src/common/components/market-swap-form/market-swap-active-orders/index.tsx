import React, { useEffect, useState } from "react";
import { ActiveUser } from "../../../store/active-user/types";
import { getOpenOrder, OpenOrdersData } from "../../../api/hive";
import { GenericOrderItem } from "./generic-order-item";
import { _t } from "../../../i18n";
import BuySellHiveDialog, { TransactionType } from "../../buy-sell-hive";
import { Global } from "../../../store/global/types";
import "./index.scss";

interface Props {
  activeUser: ActiveUser;
  global: Global;
}

export const MarketSwapActiveOrders = ({ activeUser, global }: Props) => {
  const [orders, setOrders] = useState<OpenOrdersData[]>([]);
  const [cancelingOrder, setCancelingOrder] = useState(0);

  useEffect(() => {
    fetch();
  }, [activeUser]);

  const fetch = async () => {
    try {
      const orders = await getOpenOrder(activeUser.username);
      setOrders(orders.filter((order) => order.orderid.toString().startsWith("9")));
    } catch (e) {}
  };

  return orders.length > 0 ? (
    <>
      <div className="mb-4">
        <label>
          <small className="font-bold">{_t("market.pending-orders")}</small>
        </label>
        <div className="bg-white rounded-[1rem] market-swap-active-orders">
          {orders.map((order) => (
            <div key={order.id} className="border-b border-[--border-color] pl-4 pr-2 py-3">
              <GenericOrderItem
                from={order.sell_price.base}
                to={order.sell_price.quote}
                createdAt={order.created}
                onCancel={() => setCancelingOrder(order.orderid)}
              />
            </div>
          ))}
        </div>
      </div>
      {cancelingOrder ? (
        <BuySellHiveDialog
          Ttype={TransactionType.Cancel}
          onHide={() => setCancelingOrder(0)}
          global={global}
          onTransactionSuccess={() => fetch()}
          activeUser={activeUser}
          orderid={cancelingOrder}
        />
      ) : (
        <></>
      )}
    </>
  ) : (
    <></>
  );
};
