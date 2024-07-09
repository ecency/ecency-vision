import React from "react";
import "./index.scss";
import { Table, Td, Th, Tr } from "@ui/table";
import { MarketStatistics } from "@/entities";
import { Skeleton } from "@/features/shared";
import i18next from "i18next";

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
          <Th>{i18next.t("market.last-price")}</Th>
          <Th>{i18next.t("market.volume")}</Th>
          <Th>{i18next.t("market.bid")}</Th>
          <Th>{i18next.t("market.ask")}</Th>
          <Th>{i18next.t("market.spread")}</Th>
        </Tr>
      </thead>
      <tbody>
        <Tr>
          <Td>
            ${data ? parseFloat(data!.latest!).toFixed(6) : null} (
            <span className="text-green">+0.00%</span>)
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
