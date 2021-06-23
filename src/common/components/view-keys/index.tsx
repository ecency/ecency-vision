import React from "react";

import {Button, Form, FormControl, Modal, Spinner} from "react-bootstrap";

import {PrivateKey, KeyRole, cryptoUtils} from "@hiveio/dhive";

import base58 from "bs58";

import {ActiveUser} from "../../store/active-user/types";

import BaseComponent from "../base";
import {error, success} from "../feedback";

import {updatePassword, formatError} from "../../api/operations";

import random from "../../util/rnd";

import {_t} from "../../i18n";

import {keySvg} from "../../img/svg";

interface Props {
    activeUser: ActiveUser;
    onUpdate: () => void;
}

interface State {
    curPass: string,
    keys: any,
    inProgress: boolean,
}

export class ViewKeys extends BaseComponent<Props, State> {
    state: State = {
        curPass: "",
        keys: {},
        inProgress: false
    };

    form = React.createRef<HTMLFormElement>();

    curPassChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        this.stateSet({curPass: e.target.value});
    }

    genKeys = () => {
        const {activeUser, onUpdate} = this.props;
        const {curPass} = this.state;

        if (!activeUser.data.__loaded) {
            return;
        }

        this.stateSet({inProgress: true});

        const newPrivateKeys = {active: "", memo: "", owner: "", posting: ""};

        try {
            ['owner', 'active', 'posting', 'memo'].forEach(r => {
                const k = PrivateKey.fromLogin(activeUser.username, curPass, r as KeyRole);
                newPrivateKeys[r] = k.toString();
            });    
        } catch (error) {
            error(formatError(error));
        }
        
        this.stateSet({inProgress: false, keys: newPrivateKeys});
    }

    render() {
        const {activeUser} = this.props;
        const {curPass, keys, inProgress} = this.state;

        return <div className="dialog-content">
            <Form ref={this.form} onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (!this.form.current?.checkValidity()) {
                    return;
                }

                this.genKeys();
            }}>
                <Form.Group controlId="account-name">
                    <Form.Label>{_t("view-keys.account")}</Form.Label>
                    <Form.Control type="text" readOnly={true} value={activeUser.username}/>
                </Form.Group>
                <Form.Group controlId="cur-pass">
                    <Form.Label>{_t("view-keys.cur-pass")}</Form.Label>
                    <Form.Control value={curPass} onChange={this.curPassChanged} required={true} type="password" autoFocus={true} autoComplete="off"/>
                </Form.Group>
                <Form.Group controlId="new-pass">
                    <Form.Label>{_t("view-keys.keys")}</Form.Label>
                    <div>
                        {!keys.posting && (<Button variant="outline-primary" onClick={this.genKeys}>{_t("view-keys.view-keys")}</Button>)}
                        {keys.owner && <p className="pass-generated">{`${_t("view-keys.owner")}: ${keys.owner}`}</p>}
                        {keys.active && <p className="pass-generated">{`${_t("view-keys.active")}: ${keys.active}`}</p>}
                        {keys.posting && <p className="pass-generated">{`${_t("view-keys.posting")}: ${keys.posting}`}</p>}
                        {keys.posting && <p className="pass-generated">{`${_t("view-keys.memo")}: ${keys.memo}`}</p>}
                    </div>
                </Form.Group>
            </Form>
        </div>
    }
}

interface DialogProps {
    activeUser: ActiveUser;
}


interface DialogState {
    dialog: boolean
}


export default class ViewKeysDialog extends BaseComponent<DialogProps, DialogState> {
    state: DialogState = {
        dialog: false
    }

    toggleDialog = () => {
        const {dialog} = this.state;
        this.stateSet({dialog: !dialog});
    }

    render() {
        const {dialog} = this.state;

        return <>
            <Button onClick={this.toggleDialog} size="sm">{keySvg} {_t('view-keys.title')}</Button>

            {dialog && (
                <Modal show={true} centered={true} onHide={this.toggleDialog} animation={false} backdrop="static" keyboard={false} className="password-update-modal">
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{_t('view-keys.title')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ViewKeys {...this.props} onUpdate={this.toggleDialog}/>
                    </Modal.Body>
                </Modal>
            )}
        </>
    }
}

