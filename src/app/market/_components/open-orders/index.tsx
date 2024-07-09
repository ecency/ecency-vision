import React, { useState } from "react";
import { Button } from "@ui/button";
import { Table, Td, Th, Tr } from "@ui/table";
import i18next from "i18next";
import { OpenOrdersData } from "@/entities";
import { BuySellHiveDialog, Skeleton } from "@/features/shared";
import { BuySellHiveTransactionType } from "@/enums";
import { dateToFormatted, dateToFullRelative, formattedNumber } from "@/utils";

const columns = [
  `${i18next.t("market.date")}`,
  `${i18next.t("market.type")}`,
  `${i18next.t("market.price")}`,
  `HIVE`,
  `HBD ($)`,
  `${i18next.t("market.action")}`
];

interface Props {
  data: OpenOrdersData[];
  loading: boolean;
  username: string;
  onTransactionSuccess: () => void;
  compat?: boolean;
  rounded?: boolean;
}

export const OpenOrders = ({ data, loading, onTransactionSuccess, compat, rounded }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<number>(0);

  return loading ? (
    <Skeleton className="loading-hive" />
  ) : (
    <div className="rounded">
      {isModalOpen ? (
        <>
          <BuySellHiveDialog
            type={BuySellHiveTransactionType.Cancel}
            onHide={() => setIsModalOpen(0)}
            onTransactionSuccess={onTransactionSuccess}
            orderid={isModalOpen}
          />
        </>
      ) : null}
      {compat ? <></> : <h5 className="text-xl my-4">{i18next.t("market.open-orders")}</h5>}
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
                  className={item.sell_price.base.indexOf("HIVE") > 0 ? "text-red" : "text-green"}
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
                    {i18next.t("g.cancel")}
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
