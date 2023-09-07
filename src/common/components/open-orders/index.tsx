import React, { useState } from "react";
import { OpenOrdersData } from "../../api/hive";
import BuySellHiveDialog, { TransactionType } from "../buy-sell-hive";
import { _t } from "../../i18n";
import { Skeleton } from "../skeleton";
import { ActiveUser } from "../../store/active-user/types";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import { Button } from "@ui/button";
import { Table, Td, Th, Tr } from "@ui/table";
import formattedNumber from "../../util/formatted-number";

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
  rounded?: boolean;
}

export const OpenOrders = ({
  data,
  loading,
  onTransactionSuccess,
  activeUser,
  compat,
  rounded
}: Props) => {
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
      <Table full={true} rounded={rounded}>
        <thead>
          <Tr>
            {columns.map((item) => (
              <Th key={item}>{item}</Th>
            ))}
          </Tr>
        </thead>
        <tbody>
          {data.map((item) => {
            return (
              <Tr key={item.id}>
                <Td title={dateToFormatted(item.created)}>{dateToFullRelative(item.created)}</Td>
                <Td
                  className={
                    item.sell_price.base.indexOf("HIVE") > 0 ? "text-danger" : "text-success"
                  }
                >
                  {item.sell_price.base.indexOf("HIVE") > 0 ? "Sell" : "Buy"}
                </Td>
                <Td>{formattedNumber(item.real_price)}</Td>
                <Td>
                  {item.sell_price.base.indexOf("HIVE") > 0
                    ? item.sell_price.base.replace("HIVE", "")
                    : item.sell_price.quote.replace("HIVE", "")}
                </Td>
                <Td>
                  {item.sell_price.base.indexOf("HIVE") > 0
                    ? item.sell_price.quote.replace("HBD", "")
                    : item.sell_price.base.replace("HBD", "")}
                </Td>
                <Td className="p-2">
                  <Button size="sm" onClick={() => setIsModalOpen(item.orderid)}>
                    {_t("g.cancel")}
                  </Button>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
