import React from 'react';
import {Button, Form, InputGroup} from 'react-bootstrap';
import { _t } from '../../i18n';
import { Skeleton } from '../skeleton';

interface Props {
    type: 1| 2 ;
    available: string;
    peakValue: number;
    loading: boolean;
}

export const HiveBarter = ({type, available, peakValue, loading}: Props) => {
    const buyHive = (e:any) => {
    e.preventDefault();
    const { placeOrder, user } = this.props;
    if (!user) return;
    const amount_to_sell = parseFloat(
        ReactDOM.findDOMNode(this.refs.buyHive_total).value
    );
    const min_to_receive = parseFloat(
        ReactDOM.findDOMNode(this.refs.buyHive_amount).value
    );
    const price = (amount_to_sell / min_to_receive).toFixed(6);
    const { lowest_ask } = this.props.ticker;
    placeOrder(
        user,
        `${amount_to_sell} ${DEBT_TICKER}`,
        `${min_to_receive} ${LIQUID_TICKER}`,
        `${CURRENCY_SIGN}${price}/${LIQUID_TICKER}`,
        !!this.state.buy_price_warning,
        lowest_ask,
        (msg) => {
            this.props.notify(msg);
            this.props.reload(user);
        }
    );
};

const sellHive = (e:any) => {
    e.preventDefault();
    const { placeOrder, user } = this.props;
    if (!user) return;
    const min_to_receive = parseFloat(
        ReactDOM.findDOMNode(this.refs.sellHive_total).value
    );
    const amount_to_sell = parseFloat(
        ReactDOM.findDOMNode(this.refs.sellHive_amount).value
    );
    const price = (min_to_receive / amount_to_sell).toFixed(6);
    const { highest_bid } = this.props.ticker;
    placeOrder(
        user,
        `${amount_to_sell} ${LIQUID_TICKER}`,
        `${min_to_receive} ${DEBT_TICKER}`,
        `${CURRENCY_SIGN}${price}/${LIQUID_TICKER}`,
        !!this.state.sell_price_warning,
        highest_bid,
        (msg) => {
            this.props.notify(msg);
            this.props.reload(user);
        }
    );
};

    return loading ? <Skeleton className="loading-hive"/> : <div className="border p-3 rounded">
        <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">{type === 1 ? _t("market.buy") : _t("market.sell")} {_t("wallet.hive")}</h3>
            <div>
                <small className="d-flex">
                    <div className="mr-1 text-primary">{_t("market.available")}:</div>
                    <div>{available}</div>
                </small>
                <small className="d-flex">
                    <div className="mr-1 text-primary">{type === 1 ? _t("market.lowest-ask") : _t("market.highest-bid")}:</div>
                    <div>{peakValue.toFixed(6)}</div>
                </small>
            </div>
        </div>
        <hr />
        <Form>
            <Form.Group>
                <Form.Label>{_t("market.price")}</Form.Label>
                <InputGroup >
                    <Form.Control
                        value={peakValue.toFixed(6)}
                        placeholder="0.0"
                    />
                    <InputGroup.Text className="rounded-left">{_t("market.hbd")}/{_t("wallet.hive")}</InputGroup.Text>
                </InputGroup>
            </Form.Group>

            <Form.Group>
                <Form.Label>{_t("market.amount")}</Form.Label>
                <InputGroup >
                    <Form.Control
                    placeholder="0.0"
                    />
                    <InputGroup.Text className="rounded-left">{_t("wallet.hive")}</InputGroup.Text>
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label>{_t("market.total")}</Form.Label>
                <InputGroup >
                    <Form.Control
                    placeholder="0.0"
                    />
                    <InputGroup.Text className="rounded-left">{_t("market.hbd")}($)</InputGroup.Text>
                </InputGroup>
            </Form.Group>
            <Button block={true}>{type === 1 ? _t("market.buy") : _t("market.sell")}</Button>
        </Form>
    </div>
}