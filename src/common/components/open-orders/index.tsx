import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { OpenOrdersData } from "../../api/hive";
import BuySellHiveDialog, { TransactionType } from "../buy-sell-hive";
import { _t } from "../../i18n";
import { Skeleton } from "../skeleton";
import { ActiveUser } from "../../store/active-user/types";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import { Button } from "@ui/button";

const columns = [
  `${_t("market.date")}`,
  `${_t("market.type")}`,
  `${_t("market.price")}`,
  `HIVE`,
  `HBD ($)`,
  `${_t("market.action")}`
];

interface Props {
  data: OpenOrdersData[];
  loading: boolean;
  username: string;
  onTransactionSuccess: () => void;
  activeUser: ActiveUser;
  compat?: boolean;
}

export const OpenOrders = ({ data, loading, onTransactionSuccess, activeUser, compat }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<number>(0);

  return loading ? (
    <Skeleton className="loading-hive" />
  ) : (
    <div className="rounded">
      {isModalOpen ? (
        <>
          <BuySellHiveDialog
            Ttype={TransactionType.Cancel}
            onHide={() => setIsModalOpen(0)}
            global={global}
            onTransactionSuccess={onTransactionSuccess}
            activeUser={activeUser}
            orderid={isModalOpen}
          />
        </>
      ) : null}
      {compat ? <></> : <h5>{_t("market.open-orders")}</h5>}
      <Table striped={true} bordered={true} hover={true} size="sm">
        <thead>
          <tr>
            {columns.map((item) => (
              <th key={item}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            return (
              <tr key={item.id}>
                <td title={dateToFormatted(item.created)}>{dateToFullRelative(item.created)}</td>
                <td
                  className={
                    item.sell_price.base.indexOf("HIVE") > 0 ? "text-danger" : "text-success"
                  }
                >
                  {item.sell_price.base.indexOf("HIVE") > 0 ? "Sell" : "Buy"}
                </td>
                <td>{parseFloat(item.real_price).toFixed(6)}</td>
                <td>
                  {item.sell_price.base.indexOf("HIVE") > 0
                    ? item.sell_price.base.replace("HIVE", "")
                    : item.sell_price.quote.replace("HIVE", "")}
                </td>
                <td>
                  {item.sell_price.base.indexOf("HIVE") > 0
                    ? item.sell_price.quote.replace("HBD", "")
                    : item.sell_price.base.replace("HBD", "")}
                </td>
                <td className="p-2">
                  <Button size="sm" onClick={() => setIsModalOpen(item.orderid)}>
                    {_t("g.cancel")}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
