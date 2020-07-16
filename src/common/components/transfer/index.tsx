import React, {Component} from "react";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Modal, Form, Row, Col, InputGroup, FormControl} from "react-bootstrap";
import LinearProgress from "../linear-progress";
import amountFormatCheck from '../../helper/amount-format-check';
import parseAsset from "../../helper/parse-asset";

import {getAccount} from "../../api/hive";
import {_t} from "../../i18n";
import {success, error} from "../feedback";

import {formatError} from "../../api/operations";

import badActors from '../../constants/bad-actors.json';
import {Account} from '../../store/accounts/types'

export type TransferMode = 'transfer' | 'transfer-saving' | 'convert' | 'withdraw-saving' | 'power-up';
export type TransferAsset = 'HIVE' | 'HBD';


class AssetSwitch extends Component<{
    selected: TransferAsset;
    onChange: (i: TransferAsset) => void
}> {
    clicked = (i: TransferAsset) => {
        this.setState({selected: i});
        const {onChange} = this.props;
        onChange(i);
    };

    render() {
        const {selected} = this.props;

        return (
            <div className="asset-switch">
                <a
                    onClick={() => this.clicked('HIVE')}
                    className={`asset ${selected === 'HIVE' ? 'selected' : ''}`}
                >
                    HIVE
                </a>
                <a
                    onClick={() => this.clicked('HBD')}
                    className={`asset ${selected === 'HBD' ? 'selected' : ''}`}
                >
                    HBD
                </a>
            </div>
        );
    }
}


interface Props {
    mode: TransferMode,
    asset: TransferAsset,
    users: User[];
    activeUser: ActiveUser;
}

interface State {
    step: 1 | 2 | 3;
    asset: TransferAsset;
    to: string,
    toData: Account | null,
    toError: string,
    toWarning: string,
    amount: string,
    amountError: string | null;
    inProgress: boolean;
}

export class TransferDialog extends Component<Props, State> {
    state: State = {
        step: 1,
        asset: this.props.asset,
        to: '',
        toData: null,
        toError: '',
        toWarning: '',
        amount: '0.001',
        amountError: null,
        inProgress: false
    }

    _timer: any = null;
    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (obj: {}, cb: () => void = () => {
    }) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    assetChanged = (asset: TransferAsset) => {
        this.stateSet({asset}, () => {
            this.checkAmount();
        });
    };

    toChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const {value: to} = e.target;

        this.stateSet({to});

        if (this._timer) {
            clearTimeout(this._timer);
        }

        this._timer = setTimeout(() => {
            if (badActors.includes(to)) {
                this.stateSet({
                    toWarning: _t("transfer.to-bad-actor")
                });
            } else {
                this.stateSet({toWarning: ''});
            }

            this.stateSet({inProgress: true, toData: null});

            return getAccount(to)
                .then(resp => {
                    if (resp) {
                        this.stateSet({toError: '', toData: resp});
                    } else {
                        this.stateSet({
                            toError: _t("transfer.to-not-found")
                        });
                    }

                    return resp;
                })
                .catch(err => {
                    error(formatError(err));
                })
                .finally(() => {
                    this.stateSet({inProgress: false});
                });
        }, 500);
    };

    amountChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value: amount} = e.target;
        this.stateSet({amount}, () => {
            this.checkAmount();
        });
    };

    checkAmount = () => {
        const {amount} = this.state;

        if (!amountFormatCheck(amount)) {
            this.stateSet({
                amountError: _t("transfer.wrong-amount")
            });
            return;
        }

        const dotParts = amount.split('.');
        if (dotParts.length > 1) {
            const precision = dotParts[1];
            if (precision.length > 3) {
                this.stateSet({
                    amountError: _t("transfer.amount-precision-error")
                });
                return;
            }
        }

        if (parseFloat(amount) > this.getBalance()) {
            this.stateSet({
                amountError: _t("transfer.insufficient-funds")
            });

            return;
        }

        this.stateSet({amountError: null});
    };

    getBalance = (): number => {
        const {mode, activeUser} = this.props;
        const {asset} = this.state;

        const {data: account} = activeUser;

        if (mode === 'withdraw-saving') {
            const k = asset === 'HIVE' ? 'savings_balance' : 'savings_sbd_balance';
            return parseAsset(account[k]).amount;
        }

        const k = asset === 'HIVE' ? 'balance' : 'sbd_balance';
        return parseAsset(account[k]).amount;
    };

    render() {
        const {mode, activeUser} = this.props;
        const {step, asset, to, toError, toWarning, amount, amountError, inProgress} = this.state;

        return <div className="transfer-dialog-content">
            {step === 1 && (
                <div
                    className={`transfer-box ${inProgress ? 'in-progress' : ''}`}
                >
                    <div className="transfer-box-header">
                        <div className="step-no">1</div>
                        <div className="box-titles">
                            <div className="main-title">
                                {mode === 'transfer' && _t('transfer.transfer-title')}
                                {mode === 'transfer-saving' && _t('transfer.transfer-saving-title')}
                                {mode === 'withdraw-saving' && _t('transfer.withdraw-saving-title')}
                                {mode === 'power-up' && _t('transfer.power-up-title')}
                                {mode === 'convert' && _t('transfer.convert-title')}
                            </div>
                            <div className="sub-title">
                                {mode === 'transfer' && _t('transfer.transfer-sub-title')}
                                {mode === 'transfer-saving' && _t('transfer.transfer-saving-sub-title')}
                                {mode === 'withdraw-saving' && _t('transfer.withdraw-saving-sub-title')}
                                {mode === 'power-up' && _t('transfer.power-up-sub-title')}
                                {mode === 'convert' && _t('transfer.convert-sub-titles')}
                            </div>
                        </div>
                    </div>
                    {inProgress && <LinearProgress/>}
                    <Form className="transfer-box-body">
                        <div className="transfer-form">
                            <Form.Group as={Row}>
                                <Form.Label column={true} sm="2">
                                    {_t("transfer.from")}
                                </Form.Label>
                                <Col sm="10">
                                    <InputGroup>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>@</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control value={activeUser.username} readOnly={true}/>
                                    </InputGroup>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column={true} sm="2">
                                    {_t("transfer.to")}
                                </Form.Label>
                                <Col sm="10">
                                    <InputGroup>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>@</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control
                                            autoFocus={true}
                                            placeholder={_t("transfer.to-placeholder")}
                                            value={to}
                                            onChange={this.toChanged}
                                            className={toError ? "is-invalid" : ""}
                                        />
                                        {toWarning && (
                                            <Form.Text className="text-danger">{toWarning}</Form.Text>
                                        )}
                                        {toError && (
                                            <Form.Text className="text-danger">{toError}</Form.Text>
                                        )}
                                    </InputGroup>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column={true} sm="2">
                                    {_t("transfer.amount")}
                                </Form.Label>
                                <Col sm="6">
                                    <InputGroup>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>@</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control placeholder={_t("transfer.amount-placeholder")} value={amount} onChange={this.amountChanged}
                                                      className={amountError ? "is-invalid" : ""}/>
                                    </InputGroup>
                                    {amountError && (<Form.Text className="text-danger">{amountError}</Form.Text>)}
                                </Col>
                                <Col sm="4" className="d-flex align-items-center">
                                    {mode !== 'power-up' && (
                                        <AssetSwitch
                                            selected={asset}
                                            onChange={this.assetChanged}
                                        />
                                    )}
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row}>
                                <Form.Label column={true} sm="2">
                                    {_t("transfer.memo")}
                                </Form.Label>
                                <Col sm="10">
                                    <Form.Control placeholder={_t("transfer.memo-placeholder")}/>
                                    <Form.Text className="text-muted">
                                        {_t("transfer.memo-help")}
                                    </Form.Text>
                                </Col>
                            </Form.Group>
                        </div>
                    </Form>
                </div>
            )}
        </div>
    }
}


interface Props {
    onHide: () => void;
}

export default class Transfer extends Component<Props> {
    render() {
        const {onHide} = this.props;
        return (
            <Modal animation={false} show={true} centered={true} onHide={onHide} keyboard={false} className="transfer-dialog">
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <TransferDialog {...this.props} />
                </Modal.Body>
            </Modal>
        );
    }
}
