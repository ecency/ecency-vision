import React, { useEffect, useState } from "react";
import { FormLabel, ListGroup, ListGroupItem } from "react-bootstrap";
import { ActiveUser } from "../../store/active-user/types";
import { getOpenOrder, OpenOrdersData } from "../../api/hive";
import { GenericOrderItem } from "./generic-order-item";
import { _t } from "../../i18n";
import BuySellHiveDialog, { TransactionType } from "../buy-sell-hive";
import { Global } from "../../store/global/types";

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
      setOrders(await getOpenOrder(activeUser.username));
    } catch (e) {}
  };

  return orders.length > 0 ? (
    <>
      <div className="my-4">
        <FormLabel>
          <small className="font-weight-bold">{_t("market.open-orders")}</small>
        </FormLabel>
        <ListGroup className="market-swap-active-orders">
          {orders.map((order) => (
            <ListGroupItem key={order.id} className="border-bottom">
              <GenericOrderItem
                from={order.sell_price.base}
                to={order.sell_price.quote}
                createdAt={order.created}
                onCancel={() => setCancelingOrder(order.orderid)}
              />
            </ListGroupItem>
          ))}
        </ListGroup>
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
