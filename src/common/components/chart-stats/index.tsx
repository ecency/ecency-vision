import React from "react";
import { Table } from "react-bootstrap";
import { MarketStatistics } from "../../api/hive";
import { _t } from "../../i18n";
import { isMobile } from "../../util/is-mobile";
import { Skeleton } from "../skeleton";
import "./index.scss";

interface Props {
  loading: boolean;
  data: MarketStatistics | null;
}
export const ChartStats = ({ loading, data }: Props) => {
  return loading ? (
    <Table striped={true} bordered={true} hover={true}>
      <thead>
        <tr>
          <th>
            <Skeleton className="skeleton-loading mr-5" />
          </th>
          <th>
            <Skeleton className="skeleton-loading mr-5" />
          </th>
          <th>
            <Skeleton className="skeleton-loading mr-5" />
          </th>
          <th>
            <Skeleton className="skeleton-loading mr-5" />
          </th>
          <th>
            <Skeleton className="skeleton-loading mr-5" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Skeleton className="skeleton-loading mr-5" />
          </td>
          <td>
            <Skeleton className="skeleton-loading mr-5" />
          </td>
          <td>
            <Skeleton className="skeleton-loading mr-5" />
          </td>
          <td>
            <Skeleton className="skeleton-loading mr-5" />
          </td>
          <td>
            <Skeleton className="skeleton-loading mr-5" />
          </td>
        </tr>
      </tbody>
    </Table>
  ) : (
    <Table striped={true} bordered={true} hover={true} size={isMobile() ? "sm" : "lg"}>
      <thead>
        <tr>
          <th>{_t("market.last-price")}</th>
          <th>{_t("market.volume")}</th>
          <th>{_t("market.bid")}</th>
          <th>{_t("market.ask")}</th>
          <th>{_t("market.spread")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            ${data ? parseFloat(data!.latest!).toFixed(6) : null} (
            <span className="text-success">+0.00%</span>)
          </td>
          <td>${data ? parseFloat(data!.hbd_volume)!.toFixed(2) : null}</td>
          <td>${data ? parseFloat(data!.highest_bid)!.toFixed(6) : null}</td>
          <td>${data ? parseFloat(data!.lowest_ask)!.toFixed(6) : null}</td>
          <td>
            {data
              ? (
                  (200 * (parseFloat(data.lowest_ask) - parseFloat(data.highest_bid))) /
                  (parseFloat(data.highest_bid) + parseFloat(data.lowest_ask))
                ).toFixed(3)
              : null}
            %
          </td>
        </tr>
      </tbody>
    </Table>
  );
};
