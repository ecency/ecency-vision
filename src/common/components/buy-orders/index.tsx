import React from 'react';
import { Table } from 'react-bootstrap';

const buyColumns = ['Total HBD ($)','HBD ($)','Hive','Price']
const sellColumns = [...buyColumns.reverse()];
const tradeColumns = ['Date','Price','Hive','HBD ($)'];

interface Props {
    type: 1 | 2 | 3;
}

export const Orders = ({type}: Props) => {
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
    return <div className="rounded">
                <h2>{title}</h2>
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        {columns.map(item => <th key={item}>{item}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td>@mdo</td>
                    </tr>
                    <tr>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td>@fat</td>
                    </tr>
                    <tr>
                        <td colSpan="2">Larry the Bird</td>
                        <td>@twitter</td>
                    </tr>
                    </tbody>
                </Table>
            </div>
}