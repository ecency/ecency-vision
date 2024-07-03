import React, { useCallback, useEffect, useState } from "react";
import { GenericOrderItem } from "./generic-order-item";
import "./index.scss";
import { OpenOrdersData } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { getOpenOrder } from "@/api/hive";
import i18next from "i18next";
import { BuySellHiveDialog } from "@/features/shared";
import { BuySellHiveTransactionType } from "@/enums";

export const MarketSwapActiveOrders = () => {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [orders, setOrders] = useState<OpenOrdersData[]>([]);
  const [cancelingOrder, setCancelingOrder] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const orders = await getOpenOrder(activeUser!.username);
      setOrders(orders.filter((order) => order.orderid.toString().startsWith("9")));
    } catch (e) {}
  }, [activeUser]);

  useEffect(() => {
    fetch();
  }, [activeUser, fetch]);

  return orders.length > 0 ? (
    <>
      <div className="mb-4">
        <label>
          <small className="font-bold">{i18next.t("market.pending-orders")}</small>
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
          type={BuySellHiveTransactionType.Cancel}
          onHide={() => setCancelingOrder(0)}
          onTransactionSuccess={() => fetch()}
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
