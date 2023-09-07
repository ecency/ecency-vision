import React from "react";
import { MarketStatistics } from "../../api/hive";
import { _t } from "../../i18n";
import { Skeleton } from "../skeleton";
import "./index.scss";
import { Table, Td, Th, Tr } from "@ui/table";

interface Props {
  loading: boolean;
  data: MarketStatistics | null;
}
export const ChartStats = ({ loading, data }: Props) => {
  return loading ? (
    <Table full={true}>
      <thead>
        <Tr>
          <Th>
            <Skeleton className="skeleton-loading mr-5" />
          </Th>
          <Th>
            <Skeleton className="skeleton-loading mr-5" />
          </Th>
          <Th>
            <Skeleton className="skeleton-loading mr-5" />
          </Th>
          <Th>
            <Skeleton className="skeleton-loading mr-5" />
          </Th>
          <Th>
            <Skeleton className="skeleton-loading mr-5" />
          </Th>
        </Tr>
      </thead>
      <tbody>
        <Tr>
          <Td>
            <Skeleton className="skeleton-loading mr-5" />
          </Td>
          <Td>
            <Skeleton className="skeleton-loading mr-5" />
          </Td>
          <Td>
            <Skeleton className="skeleton-loading mr-5" />
          </Td>
          <Td>
            <Skeleton className="skeleton-loading mr-5" />
          </Td>
          <Td>
            <Skeleton className="skeleton-loading mr-5" />
          </Td>
        </Tr>
      </tbody>
    </Table>
  ) : (
    <Table full={true}>
      <thead>
        <Tr>
          <Th>{_t("market.last-price")}</Th>
          <Th>{_t("market.volume")}</Th>
          <Th>{_t("market.bid")}</Th>
          <Th>{_t("market.ask")}</Th>
          <Th>{_t("market.spread")}</Th>
        </Tr>
      </thead>
      <tbody>
        <Tr>
          <Td>
            ${data ? parseFloat(data!.latest!).toFixed(6) : null} (
            <span className="text-success">+0.00%</span>)
          </Td>
          <Td>${data ? parseFloat(data!.hbd_volume)!.toFixed(2) : null}</Td>
          <Td>${data ? parseFloat(data!.highest_bid)!.toFixed(6) : null}</Td>
          <Td>${data ? parseFloat(data!.lowest_ask)!.toFixed(6) : null}</Td>
          <Td>
            {data
              ? (
                  (200 * (parseFloat(data.lowest_ask) - parseFloat(data.highest_bid))) /
                  (parseFloat(data.highest_bid) + parseFloat(data.lowest_ask))
                ).toFixed(3)
              : null}
            %
          </Td>
        </Tr>
      </tbody>
    </Table>
  );
};
