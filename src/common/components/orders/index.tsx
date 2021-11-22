import React from 'react';
import { Table } from 'react-bootstrap';
import { OrdersDataItem, TradeDataItem } from '../../api/hive';
import { Skeleton } from '../skeleton';
import Pagination from '../pagination';
import { useState } from 'react';
import moment from 'moment';
import { _t } from '../../i18n';

const buyColumns = [
    `${_t("market.total")} ${_t("market.hbd")} ($)`,
    `${_t("market.hbd")} ($)`,
    `${_t("wallet.hive")}`,
    `${_t("market.price")}`
];

const sellColumns = [
    `${_t("market.price")}`,
    `${_t("wallet.hive")}`,
    `${_t("market.hbd")} ($)`,
    `${_t("market.total")} ${_t("market.hbd")} ($)`
];

const tradeColumns = [
    `${_t("market.date")}`,
    `${_t("market.price")}`,
    `${_t("wallet.hive")}`,
    `${_t("market.hbd")} ($)`
];

export interface MappedData {
    key1:string | number,
    key2:string | number,
    key3:string | number,
    key4:string | number
}

interface Props {
    type: 1 | 2 | 3;
    loading: boolean;
    data: OrdersDataItem[] | TradeDataItem[];
}

export const Orders = ({type, loading, data}: Props) => {
    const [page, setPage] = useState(1)
    let columns = buyColumns;
    let title = `${_t("market.buy")} ${_t("market.orders")}`;
    let mappedData: MappedData[] = [];
    switch(type){
        case 1:
            mappedData = data.map((item:any) => {
                return {
                    key1: (item as OrdersDataItem).hbd,
                    key2: (item as OrdersDataItem).order_price.quote,
                    key3: (item as OrdersDataItem).hive,
                    key4: parseFloat((item as OrdersDataItem).real_price).toFixed(6)
                }
            })
            break;
        case 2:
            columns = sellColumns;
            title = `${_t("market.sell")} ${_t("market.orders")}`;
            mappedData = data.map((item:any) => {
                return {
                    key4: (item as OrdersDataItem).hbd,
                    key3: (item as OrdersDataItem).order_price.quote,
                    key2: (item as OrdersDataItem).hive,
                    key1: parseFloat((item as OrdersDataItem).real_price).toFixed(6)
                }
            })
            break;
        case 3:
            columns = tradeColumns;
            title = `${_t("market.trade-history")}`;
            mappedData = data.map((item:any) => {
                return {
                    key4:(item as TradeDataItem).current_pays,
                    key3: (item as TradeDataItem).open_pays,
                    key2: 'price',
                    key1: moment.utc((item as TradeDataItem).date).local().fromNow()
                }
            }).reverse()
            break;
    }

    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const sliced = mappedData.slice(start, end);

    return loading ? <Skeleton className="loading-hive" /> : <div className="rounded">
                <h5>{title}</h5>
                <Table striped={true} bordered={true} hover={true} size="sm">
                    <thead>
                    <tr>
                        {columns.map(item => <th key={item}>{item}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {sliced.map((item, index) => <tr key={`${item.key1}-${index}`}>
                            <td>{item.key1}</td>
                            <td>{item.key2}</td>
                            <td>{item.key3}</td>
                            <td>{item.key4}</td>
                        </tr>)}
                    </tbody>
                </Table>
                {data.length > pageSize && 
                    <Pagination
                        className="justify-content-center flex-wrap"
                        dataLength={data.length}
                        pageSize={pageSize}
                        maxItems={8}
                        page={page}
                        onPageChange={(page) => setPage(page)}
                    />
                }
            </div>
}