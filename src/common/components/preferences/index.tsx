import React, {Component} from "react";


import {Global} from "../../store/global/types";

import {Col, Form, FormControl} from "react-bootstrap";

import {getCurrencyRate} from "../../api/misc";

import currencies from "../../constants/currencies.json";

import {_t} from "../../i18n";
import {success} from "../feedback";

const getSymbolFromCurrency = require("currency-symbol-map");

interface Props {
    global: Global;
    muteNotifications: () => void;
    unMuteNotifications: () => void;
    setCurrency: (currency: string, rate: number, symbol: string) => void;
}

interface State {
    inProgress: boolean
}

export class Preferences extends Component<Props, State> {
    state: State = {
        inProgress: false,
    }

    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    notificationsChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const {muteNotifications, unMuteNotifications} = this.props;

        if (e.target.value === "1") {
            unMuteNotifications();
        }

        if (e.target.value === "0") {
            muteNotifications();
        }

        success(_t('preferences.updated'));
    }

    currencyChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const {value: currency} = e.target;

        this.stateSet({inProgress: true});
        getCurrencyRate(currency).then(rate => {
            const symbol = getSymbolFromCurrency(currency);
            const {setCurrency} = this.props;

            setCurrency(currency, rate, symbol);
            success(_t('preferences.updated'));
        }).finally(() => {
            this.stateSet({inProgress: false});
        })
    }

    render() {
        const {global} = this.props;
        const {inProgress} = this.state;

        return <>
            <div className="preferences">
                <div className="preferences-header">{_t('preferences.title')}</div>

                <Form.Row>
                    <Col lg={6} xl={4}>
                        <Form.Group>
                            <Form.Label>{_t('preferences.notifications')}</Form.Label>
                            <Form.Control type="text" value={global.notifications ? 1 : 0} as="select" onChange={this.notificationsChanged}>
                                <option value={1}>{_t('g.on')}</option>
                                <option value={0}>{_t('g.off')}</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col lg={6} xl={4}>
                        <Form.Group>
                            <Form.Label>{_t('preferences.currency')}</Form.Label>
                            <Form.Control type="text" value={global.currency} as="select" onChange={this.currencyChanged} disabled={inProgress}>
                                {currencies.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Form.Row>
            </div>
        </>
    }
}


export default (p: Props) => {
    const props: Props = {
        global: p.global,
        muteNotifications: p.muteNotifications,
        unMuteNotifications: p.unMuteNotifications,
        setCurrency: p.setCurrency
    }

    return <Preferences {...props} />
}
