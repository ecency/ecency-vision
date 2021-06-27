import React, {Component} from "react";
import {Pagination} from "react-bootstrap";

interface Props {
    dataLength: number,
    pageSize: number,
    maxItems: number,
    page: number,
    onPageChange: (num: number) => void,
}

interface State {
    page: number;
}

export default class MyPagination extends Component<Props, State> {
    state: State = {
        page: this.props.page || 1
    }

    changePage = (num: number) => {
        const {onPageChange} = this.props;
        this.setState({page: num});
        onPageChange(num);
    }

    componentDidUpdate(prevProps: Props){
        if(prevProps.page !== this.props.page){
            this.setState({ page: this.props.page })
        }
    }

    render() {
        const {dataLength, maxItems, pageSize} = this.props;
        const {page} = this.state;

        const pages = Math.ceil(dataLength / pageSize);

        const records = [...Array(pages).keys()];

        let sliceStart = (page - maxItems / 2);
        if (sliceStart < 0) sliceStart = 0;
        let sliceEnd = sliceStart + maxItems;

        const allItems = records.map((i, x) => {
            const num = i + 1;

            return <Pagination.Item active={num === page} onClick={() => {
                this.changePage(num);
            }} key={num}>{num}</Pagination.Item>
        });

        const items = allItems.slice(sliceStart, sliceEnd);

        return <Pagination>
            <Pagination.First disabled={!(sliceStart > 0)} onClick={() => {
                this.changePage(1);
            }}/>
            <Pagination.Prev disabled={!(page > 1)} onClick={() => {
                this.changePage(page - 1);
            }}/>
            {items}
            <Pagination.Next disabled={page >= pages} onClick={() => {
                this.changePage(page + 1);
            }}/>
            <Pagination.Last disabled={page >= pages} onClick={() => {
                this.changePage(pages);
            }}/>
        </Pagination>;
    }
}
