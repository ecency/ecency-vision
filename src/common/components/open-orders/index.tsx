import moment from 'moment';
import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { cancelOpenOrder, OpenOrdersData } from '../../api/hive';
import { _t } from '../../i18n';
import { Skeleton } from '../skeleton';

const columns = [
    `${_t("market.date-created")}`,
    `${_t("market.type")}`,
    `${_t("market.price")}`,
    `${_t("wallet.hive")}`,
    `${_t("market.hbd")} ($)`,
    `${_t("market.action")}`
];

interface Props {
    data: OpenOrdersData[];
    loading: boolean;
}

export const OpenOrders = ({data, loading}: Props) => {

    const cancelTransaction = (username:string,id: number) => {
        cancelOpenOrder(username, id).then(res=>{debugger})
    }

    return loading ? <Skeleton className="loading-hive" /> : <div className="rounded">
    <h5>{_t("market.open-orders")}</h5>
    <Table striped={true} bordered={true} hover={true} size="sm">
        <thead>
        <tr>
            {columns.map(item => <th key={item}>{item}</th>)}
        </tr>
        </thead>
        <tbody>
        {data.map(item => {
            let date = moment.utc(item.created).local().format().replace("T"," ");
            date = date.substring(0, date.indexOf('+'))
        return <tr key={item.id}>
                <td>{date}</td>
                <td>{item.seller ? "Sell" : "Buy"}</td>
                <td>{parseFloat(item.real_price).toFixed(6)}</td>
                <td>{item.sell_price.base}</td>
                <td>{item.sell_price.quote}</td>
                <td className="p-2"><div className="rounded text-white bg-primary p-1 d-inline pointer" onClick={()=> cancelTransaction(item.seller, item.orderid)}>Cancel</div></td>
            </tr>})}
        </tbody>
    </Table>
    </div>
}