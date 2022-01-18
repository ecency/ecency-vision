import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import {Button, Form, InputGroup} from 'react-bootstrap';
import { placeHiveOrder } from '../../api/hive';
import { _t } from '../../i18n';
import { error } from '../feedback';
import { Skeleton } from '../skeleton';

interface Props {
    type: 1 | 2 ;
    available: string;
    username: string;
    peakValue: number;
    basePeakValue: number;
    loading: boolean;
    onClickPeakValue: () => void;
}

export const HiveBarter = ({type, available, peakValue, loading, username, basePeakValue, onClickPeakValue}: Props) => {
    const [price, setPrice] = useState(peakValue.toFixed(3));
    const [amount, setAmount] = useState<any>(0.000);
    const [total, setTotal] = useState<any>(0.000);
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(()=>{
        if(peakValue){
            setPrice(peakValue.toFixed(3))
        }
    },[peakValue])

    const buyHive = () => {
            placeHiveOrder(username, `${amount}`, total).then(res=>{
        })
    };

    const sellHive = () => {
            placeHiveOrder(username, total, `${amount}`).then(res=>{
        })
    };

    const placeOrder = (e:any) => {
        setPlacingOrder(true);
        e.preventDefault();
        type===1 ? buyHive() :sellHive()
    }

    const fixToThree = (value: string): string => {
        let splittedValue = value.split(".");
        let valueAfterPoints = splittedValue[1];
        if(valueAfterPoints && valueAfterPoints.length>3){
            valueAfterPoints = valueAfterPoints.substring(0,3);
            error("Only 3 digits after decimal are allowed!");
            return `${splittedValue[0] + "." + valueAfterPoints}`
        }
        return value
    }

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
                    <div onClick={onClickPeakValue} className='pointer'>{basePeakValue.toFixed(3)}</div>
                </small>
            </div>
        </div>
        <hr />
        <Form onSubmit={placeOrder}>
            <Form.Group>
                <Form.Label>{_t("market.price")}</Form.Label>
                <InputGroup >
                    <Form.Control
                        value={price}
                        placeholder="0.0"
                        onChange={({target:{value}}) => {
                            setPrice(value.includes('.') ? fixToThree(value) : value);
                            let refinedAmount = amount ? parseFloat(amount) : 0;
                            let total = parseFloat(`${(parseFloat(value) * refinedAmount as any)}`);
                            setTotal(total);
                        }}
                    />
                    <InputGroup.Text className="rounded-left">{_t("market.hbd")}/{_t("wallet.hive")}</InputGroup.Text>
                </InputGroup>
            </Form.Group>

            <Form.Group>
                <Form.Label>{_t("market.amount")}</Form.Label>
                <InputGroup >
                    <Form.Control
                        placeholder="0.0"
                        value={isNaN(amount)? 0 : amount}
                        onChange={({target:{value}}) => {
                                setAmount(value.includes('.') ? fixToThree(value) : value)
                                let refinedAmount = value ? parseFloat(value) : 0;
                                let total = parseFloat(`${(parseFloat(price) * refinedAmount as any)}`);
                                setTotal(total);
                            }
                        }
                    />
                    <InputGroup.Text className="rounded-left">{_t("wallet.hive")}</InputGroup.Text>
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label>{_t("market.total")}</Form.Label>
                <InputGroup >
                    <Form.Control
                        placeholder="0.0"
                        value={isNaN(total) ? 0 : total}
                        onChange={({target:{value}})=>{
                            setTotal(isNaN(value as any) ? 0 : value.includes('.') ? fixToThree(value) : value);
                            setAmount(isNaN(`${parseFloat(value)/parseFloat(price)}` as any) ? 0 : 
                            parseFloat(`${parseFloat(value)/parseFloat(price)}`).toFixed(3))}}
                    />
                    <InputGroup.Text className="rounded-left">{_t("market.hbd")}($)</InputGroup.Text>
                </InputGroup>
            </Form.Group>
            <Button block={true} type="submit">{type === 1 ? _t("market.buy") : _t("market.sell")}</Button>
        </Form>
    </div>
}