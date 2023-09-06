import React from "react";
import { Table } from "react-bootstrap";
import { dateToFormatted, dateToFullRelative } from "../../helper/parse-date";
import { _t } from "../../i18n";
import { LimitOrderCreate } from "../../store/transactions/types";
import { OpenOrdersData } from "../../api/hive";
import { AutoSizer } from "react-virtualized";
import { Button } from "@ui/button";

const columns = [
  _t("market.date"),
  _t("market.type"),
  _t("market.price"),
  "HIVE",
  "HBD",
  _t("market.action")
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
                  <tr key={item.orderid}>
                    <td title={dateToFormatted(item.timestamp)}>
                      {dateToFullRelative(item.timestamp)}
                      {openOrdersData.some((order) => order.orderid === item.orderid) ? (
                        <div className="bg-primary px-2 py-1 text-xs font-bold text-white rounded ml-2">
                          {_t("market.advanced.active")}
                        </div>
                      ) : (
                        <></>
                      )}
                    </td>
                    <td
                      className={
                        item.amount_to_sell?.indexOf("HIVE") > 0 ? "text-danger" : "text-success"
                      }
                    >
                      {item.amount_to_sell?.indexOf("HIVE") > 0 ? "Sell" : "Buy"}
                    </td>
                    <td>{getPrice(item).toFixed(6)}</td>
                    <td>
                      {getAmount(item.amount_to_sell, "HIVE") ??
                        getAmount(item.min_to_receive, "HIVE")}
                    </td>
                    <td>
                      {getAmount(item.amount_to_sell, "HBD") ??
                        getAmount(item.min_to_receive, "HBD")}
                    </td>
                    <td>
                      <Button
                        noPadding={true}
                        appearance="link"
                        size="sm"
                        target="_blank"
                        href={"https://hivexplorer.com/tx/" + item.trx_id}
                      >
                        {_t("market.advanced.view-details")}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </AutoSizer>
  );
};
