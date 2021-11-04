import React from 'react';
import {Button, Form, InputGroup} from 'react-bootstrap';
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
            <h3 className="mb-0">{type === 1 ? 'Buy' : "Sell"} Hive</h3>
            <div>
                <small className="d-flex">
                    <div className="mr-1 text-primary">Available:</div>
                    <div>{available}</div>
                </small>
                <small className="d-flex">
                    <div className="mr-1 text-primary">{type === 1 ? 'Lowest ask' : "Highest bid"}:</div>
                    <div>{peakValue.toFixed(6)}</div>
                </small>
            </div>
        </div>
        <hr />
        <Form>
            <Form.Group>
                <Form.Label>Price</Form.Label>
                <InputGroup hasValidation>
                    <Form.Control
                        value={peakValue.toFixed(6)}
                        placeholder="0.0"
                    />
                    <InputGroup.Text className="rounded-left">HBD/HIVE</InputGroup.Text>
                </InputGroup>
            </Form.Group>

            <Form.Group>
                <Form.Label>Amount</Form.Label>
                <InputGroup hasValidation>
                    <Form.Control
                    placeholder="0.0"
                    />
                    <InputGroup.Text className="rounded-left">HIVE</InputGroup.Text>
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label>Total</Form.Label>
                <InputGroup hasValidation>
                    <Form.Control
                    placeholder="0.0"
                    />
                    <InputGroup.Text className="rounded-left">HBD($)</InputGroup.Text>
                </InputGroup>
            </Form.Group>
            <Button block>{type === 1 ? 'Buy' : "Sell"}</Button>
        </Form>
    </div>
}