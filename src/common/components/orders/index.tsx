import React, { useState } from "react";
import { OrdersDataItem, TradeDataItem } from "../../api/hive";
import { Skeleton } from "../skeleton";
import Pagination from "../pagination";
import moment from "moment";
import { _t } from "../../i18n";
import { Table, Td, Th, Tr } from "@ui/table";

const buyColumns = [`${_t("market.price")}`, `HIVE`, `${_t("market.total")} HBD ($)`];

const tradeColumns = [`${_t("market.date")}`, `${_t("market.price")}`, `HIVE`, `HBD ($)`];

export interface MappedData {
  key1: string | number;
  key2: string | number;
  key3: string | number;
  key4?: string | number;
  key5?: string | number;
}

interface Props {
  type: 1 | 2 | 3;
  loading: boolean;
  data: OrdersDataItem[] | TradeDataItem[];
  onPriceClick?: (value: MappedData) => void;
}

export const Orders = ({ type, loading, data, onPriceClick }: Props) => {
  const [page, setPage] = useState(1);
  let columns = buyColumns;
  let title = `${_t("market.buy")} ${_t("market.orders")}`;
  let mappedData: MappedData[] = [];
  switch (type) {
    case 1:
      mappedData = (data as OrdersDataItem[]).map((item: OrdersDataItem) => {
        return {
          key3: (item as OrdersDataItem).hbd / 1000,
          key2: (item as OrdersDataItem).order_price.quote.replace("HIVE", ""),
          key1: parseFloat((item as OrdersDataItem).real_price).toFixed(6)
        };
      });
      break;
    case 2:
      columns = buyColumns;
      title = `${_t("market.sell")} ${_t("market.orders")}`;
      mappedData = (data as OrdersDataItem[]).map((item: OrdersDataItem) => {
        return {
          key3: (item as OrdersDataItem).hbd / 1000,
          key2: (item as OrdersDataItem).order_price.base.replace("HBD", ""),
          key1: parseFloat((item as OrdersDataItem).real_price).toFixed(6)
        };
      });
      break;
    case 3:
      columns = tradeColumns;
      title = `${_t("market.trade-history")}`;
      mappedData = (data as TradeDataItem[])
        .map((item: TradeDataItem) => {
          let hbd = parseFloat(item.current_pays.split(" ")[0]);
          let hive = parseFloat(item.open_pays.toString().split(" ")[0]);
          let type = item.current_pays.indexOf("HBD") !== -1 ? "bid" : "ask";
          let price = type === "bid" ? hbd / hive : hive / hbd;
          let stringPrice = price.toFixed(6);

          return {
            key5: type,
            key4:
              type === "bid"
                ? (item as TradeDataItem).current_pays.replace(" HBD", "")
                : (item as TradeDataItem).open_pays.replace(" HBD", ""),
            key3:
              type === "ask"
                ? (item as TradeDataItem).current_pays.replace(" HIVE", "")
                : (item as TradeDataItem).open_pays.replace(" HIVE", ""),
            key2: stringPrice,
            key1: moment
              .utc((item as TradeDataItem).date)
              .local()
              .fromNow()
          };
        })
        .reverse();
      break;
  }

  const pageSize = 12;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const sliced = mappedData.slice(start, end);

  return loading ? (
    <Skeleton className="loading-hive" />
  ) : (
    <div className="flex flex-col items-center rounded">
      <h5 className="text-xl self-start my-4">{title}</h5>
      <Table full={true}>
        <thead>
          <Tr>
            {columns.map((item) => (
              <Th key={item}>{item}</Th>
            ))}
          </Tr>
        </thead>
        <tbody>
          {sliced.map((item, index) => (
            <Tr
              key={`${item.key1}-${index}`}
              className={type === 1 || type === 2 ? "pointer" : ""}
              onClick={() => (onPriceClick ? onPriceClick(item) : {})}
            >
              <Td>{item.key1}</Td>
              <Td className={type === 3 ? (item.key5 === "bid" ? "text-green" : "text-red") : ""}>
                {item.key2}
              </Td>
              <Td>{item.key3}</Td>
              {item.key4 && <Td>{item.key4}</Td>}
            </Tr>
          ))}
        </tbody>
      </Table>
      {data.length > pageSize && (
        <Pagination
          className="justify-center mt-4 flex-wrap"
          dataLength={data.length}
          pageSize={pageSize}
          maxItems={8}
          page={page}
          onPageChange={(page) => setPage(page)}
        />
      )}
    </div>
  );
};
