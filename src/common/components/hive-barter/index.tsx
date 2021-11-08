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
            <Button block>{type === 1 ? _t("market.buy") : _t("market.sell")}</Button>
        </Form>
    </div>
}