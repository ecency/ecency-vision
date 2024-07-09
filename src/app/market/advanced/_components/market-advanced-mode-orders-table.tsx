import React from "react";
import { AutoSizer } from "react-virtualized";
import { Button } from "@ui/button";
import { Table, Td, Th, Tr } from "@ui/table";
import i18next from "i18next";
import { dateToFormatted, dateToFullRelative } from "@/utils";
import { LimitOrderCreate, OpenOrdersData } from "@/entities";

const columns = [
  i18next.t("market.date"),
  i18next.t("market.type"),
  i18next.t("market.price"),
  "HIVE",
  "HBD",
  i18next.t("market.action")
];

interface Props {
  data: LimitOrderCreate[];
  openOrdersData: OpenOrdersData[];
}

export const MarketAdvancedModeOrdersTable = ({ data, openOrdersData }: Props) => {
  const getAmount = (amount: string, asset: string) =>
    amount.includes(asset) ? amount.replace(asset, "").trim() : null;

  const getPrice = (item: LimitOrderCreate) => {
    const hive =
      getAmount(item.amount_to_sell, "HIVE") ?? getAmount(item.min_to_receive, "HIVE") ?? "0";
    const hbd =
      getAmount(item.amount_to_sell, "HBD") ?? getAmount(item.min_to_receive, "HBD") ?? "0";
    return hbd && hive ? Number(hbd) / Number(hive) : 0;
  };

  return (
    <AutoSizer>
      {({ width, height }) => (
        <div className="rounded" style={{ width: `${width}px`, height: `${height}px` }}>
          <Table rounded={false} full={true}>
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
                  <Tr key={item.orderid}>
                    <Td title={dateToFormatted(item.timestamp)}>
                      {dateToFullRelative(item.timestamp)}
                      {openOrdersData.some((order) => order.orderid === item.orderid) ? (
                        <span className="bg-primary px-2 py-1 text-xs font-bold text-white rounded ml-2">
                          {i18next.t("market.advanced.active")}
                        </span>
                      ) : (
                        <></>
                      )}
                    </Td>
                    <Td
                      className={
                        item.amount_to_sell?.indexOf("HIVE") > 0 ? "text-red" : "text-green"
                      }
                    >
                      {item.amount_to_sell?.indexOf("HIVE") > 0 ? "Sell" : "Buy"}
                    </Td>
                    <Td>{getPrice(item).toFixed(6)}</Td>
                    <Td>
                      {getAmount(item.amount_to_sell, "HIVE") ??
                        getAmount(item.min_to_receive, "HIVE")}
                    </Td>
                    <Td>
                      {getAmount(item.amount_to_sell, "HBD") ??
                        getAmount(item.min_to_receive, "HBD")}
                    </Td>
                    <Td>
                      <Button
                        noPadding={true}
                        appearance="link"
                        size="sm"
                        target="_blank"
                        href={"https://hivexplorer.com/tx/" + item.trx_id}
                      >
                        {i18next.t("market.advanced.view-details")}
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </AutoSizer>
  );
};
