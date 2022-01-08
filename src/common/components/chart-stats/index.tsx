import React from 'react';
import { Table } from 'react-bootstrap';
import { MarketStatistics } from '../../api/hive';
import { _t } from '../../i18n';
import { Skeleton } from '../skeleton';

interface Props {
    loading: boolean;
    data: MarketStatistics | null;
}
export const ChartStats = ({loading, data}: Props) =>{

    return loading ?
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th><Skeleton className="skeleton-loading mr-5" /></th>
                    <th><Skeleton className="skeleton-loading mr-5" /></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                </tr>
                <tr>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                </tr>
                <tr>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                </tr>
                <tr>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                </tr>
                <tr>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                    <td><Skeleton className="skeleton-loading mr-5" /></td>
                </tr>
            </tbody>
        </Table> :  <Table striped bordered hover>
                            <thead>
                                <tr>
                                <th>{_t("market.stock-params")}</th>
                                <th>{_t("market.stock-values")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{_t("market.last-price")}</td>
                                    <td>${data ? parseFloat(data!.latest!).toFixed(6) : null} (<span className="text-success">+0.00%</span>)</td>
                                </tr>
                                <tr>
                                    <td>{_t("market.volume")}</td>
                                    <td>${data? parseFloat(data!.hbd_volume)!.toFixed(2):null}</td>
                                </tr>
                                <tr>
                                    <td>{_t("market.bid")}</td>
                                    <td>${data? parseFloat(data!.highest_bid)!.toFixed(6):null}</td>
                                </tr>
                                <tr>
                                    <td>{_t("market.last-price")}</td>
                                    <td>${data? parseFloat(data!.highest_bid)!.toFixed(6):null}</td>
                                </tr>
                                <tr>
                                    <td>{_t("market.spread")}</td>
                                    <td>{data? ((200 * (parseFloat(data.lowest_ask) - parseFloat(data.highest_bid))) / (parseFloat(data.highest_bid) + parseFloat(data.lowest_ask))).toFixed(3) : null}%</td>
                                </tr>
                            </tbody>
                    </Table>
} 