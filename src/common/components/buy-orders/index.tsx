import React from 'react';
import { Table } from 'react-bootstrap';
import { OrdersDataItem } from '../../api/hive';
import { Skeleton } from '../skeleton';
import MyPagination from '../pagination';
import { useState } from 'react';

const buyColumns = ['Total HBD ($)','HBD ($)','Hive','Price']
const sellColumns = [...buyColumns.reverse()];
const tradeColumns = ['Date','Price','Hive','HBD ($)'];

interface Props {
    type: 1 | 2 | 3;
    loading: boolean;
    data: OrdersDataItem[];
}

export const Orders = ({type, loading, data}: Props) => {
    const [page, setPage] = useState(1)
    let columns = buyColumns;
    let title = 'Buy Orders';
    switch(type){
        case 2:
            columns = sellColumns;
            title = 'Sell Orders';
            break;
        case 3:
            columns = tradeColumns;
            title = "Trade History"
            break;
    }

    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const sliced = data.slice(start, end);

    return loading ? <Skeleton className="loading-hive" /> : <div className="rounded">
                <h5>{title}</h5>
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        {columns.map(item => <th key={item}>{item}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {sliced.map(item => <tr>
                            <td>{item.hbd}</td>
                            <td>{item.order_price.quote}</td>
                            <td>{item.hive}</td>
                            <td>{parseFloat(item.real_price).toFixed(6)}</td>
                        </tr>)}
                    </tbody>
                </Table>
                {data.length > pageSize && <MyPagination className="justify-content-center flex-wrap" dataLength={data.length} pageSize={pageSize} maxItems={10} page={page} onPageChange={(page) => {
                            setPage(page);
                }}/>}
            </div>
}