import React, {Component} from "react";

import {Modal, Form, Row, Col, InputGroup, FormControl, Button} from "react-bootstrap";

import {Account} from '../../store/accounts/types'
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";

import LinearProgress from "../linear-progress";
import {success, error} from "../feedback";

import amountFormatCheck from '../../helper/amount-format-check';
import parseAsset from "../../helper/parse-asset";

import {getAccount} from "../../api/hive";

import {formatError} from "../../api/operations";

import {_t} from "../../i18n";

import badActors from '../../constants/bad-actors.json';


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
                >HIVE</a>
                <a
                    onClick={() => this.clicked('HBD')}
                    className={`asset ${selected === 'HBD' ? 'selected' : ''}`}
                >HBD</a>
            </div>
        );
    }
}

class FormText extends Component<{
    msg: string,
    type: "danger" | "warning" | "muted";
}> {
    render() {
        return <Row>
            <Col md={{span: 10, offset: 2}}>
                <Form.Text className={`text-${this.props.type} tr-form-text`}>{this.props.msg}</Form.Text>
            </Col>
        </Row>
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
    amountError: string;
    memo: string,
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
        amountError: '',
        memo: '',
        inProgress: false
    }

    _timer: any = null;
    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
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

        if (to === '') {
            this.stateSet({toWarning: '', toError: ''});
            return;
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

    memoChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value: memo} = e.target;
        this.setState({memo});
    };

    checkAmount = () => {
        const {amount} = this.state;

        if (amount === '') {
            this.stateSet({amountError: ''});
            return;
        }

        if (!amountFormatCheck(amount)) {
            this.stateSet({amountError: _t("transfer.wrong-amount")});
            return;
        }

        const dotParts = amount.split('.');
        if (dotParts.length > 1) {
            const precision = dotParts[1];
            if (precision.length > 3) {
                this.stateSet({amountError: _t("transfer.amount-precision-error")});
                return;
            }
        }

        if (parseFloat(amount) > this.getBalance()) {
            this.stateSet({amountError: _t("transfer.insufficient-funds")});
            return;
        }

        this.stateSet({amountError: ''});
    };

    copyBalance = () => {
        const balance = this.getBalance();
        this.stateSet({amount: String(balance)}, () => {
            this.checkAmount();
        });
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

    canSubmit = () => {
        const {toData, toError, amountError, inProgress} = this.state;
        return toData && !toError && !amountError && !inProgress;
    };

    render() {
        const {mode, activeUser} = this.props;
        const {step, asset, to, toError, toWarning, amount, amountError, memo, inProgress} = this.state;

        return <div className="transfer-dialog-content">
            {step === 1 && (
                <div className={`transfer-box ${inProgress ? 'in-progress' : ''}`}>
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
                                    </InputGroup>
                                </Col>
                            </Form.Group>
                            {toWarning && (
                                <FormText msg={toWarning} type="danger"/>
                            )}
                            {toError && (
                                <FormText msg={toError} type="danger"/>
                            )}
                            <Form.Group as={Row}>
                                <Form.Label column={true} sm="2">
                                    {_t("transfer.amount")}
                                </Form.Label>
                                <Col sm="10" className="d-flex align-items-center">
                                    <InputGroup>
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>@</InputGroup.Text>
                                        </InputGroup.Prepend>
                                        <Form.Control
                                            placeholder={_t("transfer.amount-placeholder")}
                                            value={amount}
                                            onChange={this.amountChanged}
                                            className={amountError ? "is-invalid" : ""}/>
                                    </InputGroup>
                                    {mode !== 'power-up' && (
                                        <AssetSwitch
                                            selected={asset}
                                            onChange={this.assetChanged}
                                        />
                                    )}
                                </Col>
                            </Form.Group>
                            {amountError && (<FormText msg={amountError} type="danger"/>)}
                            <Row>
                                <Col md={{span: 10, offset: 2}} onClick={this.copyBalance}>
                                    <div className="balance">
                                        {_t("transfer.balance")}{": "}
                                        <span className="balance-num">{this.getBalance()} {asset}</span>
                                    </div>
                                </Col>
                            </Row>
                            <Form.Group as={Row}>
                                <Form.Label column={true} sm="2">
                                    {_t("transfer.memo")}
                                </Form.Label>
                                <Col sm="10">
                                    <Form.Control
                                        placeholder={_t("transfer.memo-placeholder")}
                                        value={memo}
                                        onChange={this.memoChanged}
                                    />
                                </Col>
                            </Form.Group>
                            <FormText msg={_t("transfer.memo-help")} type="muted"/>
                            <Form.Group as={Row}>
                                <Col sm={{span: 10, offset: 2}}>
                                    <Button disabled={!this.canSubmit()}>{_t('transfer.next')}</Button>
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
            <Modal animation={false} show={true} centered={true} onHide={onHide} keyboard={false} className="transfer-dialog" size="lg">
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <TransferDialog {...this.props} />
                </Modal.Body>
            </Modal>
        );
    }
}
