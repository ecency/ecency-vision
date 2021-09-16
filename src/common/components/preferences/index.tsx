import React from "react";

import i18n from "i18next";

import {Global} from "../../store/global/types";

import {Col, Form, FormControl, InputGroup, Button} from "react-bootstrap";

import BaseComponent from "../base";
import {success} from "../feedback";

import {_t} from "../../i18n";

import {langOptions} from "../../i18n";

import {getCurrencyRate} from "../../api/misc";

import currencySymbol from "../../helper/currency-symbol";

import currencies from "../../constants/currencies.json";
import activeUser from "../../store/active-user";
import { ActiveUser } from "../../store/active-user/types";
import { copyContent } from "../../img/svg";

interface Props {
    global: Global;
    muteNotifications: () => void;
    unMuteNotifications: () => void;
    setCurrency: (currency: string, rate: number, symbol: string) => void;
    setLang: (lang: string) => void;
    setNsfw: (value: boolean) => void;
    activeUser: ActiveUser;
}

interface State {
    inProgress: boolean
}

export class Preferences extends BaseComponent<Props, State> {
    state: State = {
        inProgress: false,
    }

    notificationsChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        const {muteNotifications, unMuteNotifications} = this.props;

        if (e.target.value === "1") {
            unMuteNotifications();
        }

        if (e.target.value === "0") {
            muteNotifications();
        }

        success(_t('preferences.updated'));
    }

    currencyChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        const {value: currency} = e.target;

        this.stateSet({inProgress: true});
        getCurrencyRate(currency).then(rate => {
            const symbol = currencySymbol(currency);
            const {setCurrency} = this.props;

            setCurrency(currency, rate, symbol);
            success(_t('preferences.updated'));
        }).finally(() => {
            this.stateSet({inProgress: false});
        })
    }

    languageChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        const {setLang} = this.props;
        const {value: code} = e.target;

        i18n.changeLanguage(code).then(() => {
            setLang(code);
            success(_t('preferences.updated'));
        });
    }

    nsfwChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        const {setNsfw} = this.props;
        const {value} = e.target;

        setNsfw(Boolean(Number(value)));
        success(_t('preferences.updated'));
    }

    copyToClipboard = (text: string) => {
        const textField = document.createElement('textarea');
        textField.innerText = text;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();
        success(_t('profile-edit.copied'));
    }

    render() {
        const { global, activeUser } = this.props;
        const { inProgress } = this.state;

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
                    <Col lg={6} xl={4}>
                        <Form.Group>
                            <Form.Label>{_t('preferences.language')}</Form.Label>
                            <Form.Control type="text" value={global.lang} as="select" onChange={this.languageChanged} disabled={inProgress}>
                                {langOptions.map(x => <option key={x.code} value={x.code}>{x.name}</option>)}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Form.Row>
                <Form.Row>
                    <Col lg={6} xl={4}>
                        <Form.Group>
                            <Form.Label>{_t('preferences.nsfw')}</Form.Label>
                            <Form.Control type="text" value={global.nsfw ? 1 : 0} as="select" onChange={this.nsfwChanged}>
                                <option value={1}>{_t('g.on')}</option>
                                <option value={0}>{_t('g.off')}</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>

                    {activeUser && activeUser.username && 
                    <Col lg={6} xl={4}>
                        <Form.Group>
                            <Form.Label>{_t('preferences.referral-link')}</Form.Label>
                            <InputGroup 
                                className="mb-3"
                                onClick={() => this.copyToClipboard(`https://weebecash.com/signup?referral=${activeUser!.username}`)}
                            >
                                <Form.Control 
                                    value={`https://weebecash.com/signup?referral=${activeUser!.username}`} 
                                    disabled={true}
                                    className="text-primary pointer"
                                />
                                <InputGroup.Append>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="copy-to-clipboard"
                                        onClick={() => this.copyToClipboard(`https://weebecash.com/signup?referral=${activeUser!.username}`)}
                                    >
                                        {copyContent}
                                    </Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </Form.Group>
                    </Col>}
                </Form.Row>
            </div>
        </>
    }
}


export default (p: Props) => {
    const props: Props = {
        global: p.global,
        activeUser: p.activeUser,
        muteNotifications: p.muteNotifications,
        unMuteNotifications: p.unMuteNotifications,
        setCurrency: p.setCurrency,
        setLang: p.setLang,
        setNsfw: p.setNsfw
    }

    return <Preferences {...props} />
}
