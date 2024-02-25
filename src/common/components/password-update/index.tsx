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
import { handleInvalid, handleOnInput } from "../../util/input-util";

interface Props {
    activeUser: ActiveUser;
    onUpdate?: () => void;
}

interface State {
    curPass: string,
    newPass: string,
    newPass2: string,
    inProgress: boolean,
}

interface KeyObject {
    active: string;
    memo: string;
    owner: string;
    posting: string;
}

export class PasswordUpdate extends BaseComponent<Props, State> {
    state: State = {
        curPass: "",
        newPass: "",
        newPass2: "",
        inProgress: false
    };

    form = React.createRef<HTMLFormElement>();

    genWif = () => {
        const newPass = 'P' + base58.encode(cryptoUtils.sha256(random()));
        this.stateSet({newPass});
    }

    curPassChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        this.stateSet({curPass: e.target.value});
    }

    newPass2Changed = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        this.stateSet({newPass2: e.target.value});
    }

    update = () => {
        const {activeUser, onUpdate} = this.props;
        const {curPass, newPass} = this.state;

        if (!activeUser.data.__loaded) {
            return;
        }

        this.stateSet({inProgress: true});

        const newPrivateKeys: KeyObject = {active: "", memo: "", owner: "", posting: ""};
        const newPublicKeys: KeyObject = {active: "", memo: "", owner: "", posting: ""};

        ['owner', 'active', 'posting', 'memo'].forEach(r => {
            const k = PrivateKey.fromLogin(activeUser.username, newPass, r as KeyRole);
            newPrivateKeys[r as keyof KeyObject] = k.toString();

            newPublicKeys[r as keyof KeyObject] = k.createPublic().toString();
        });

        const ownerKey = PrivateKey.fromLogin(activeUser.username, curPass, "owner");

        const {data: accountData} = activeUser;

        const update = {
            account: activeUser.username,
            json_metadata: accountData.json_metadata,
            owner: Object.assign({}, accountData.owner, {
                key_auths: [[newPublicKeys.owner, 1]]
            }),
            active: Object.assign({}, accountData.active, {
                key_auths: [[newPublicKeys.active, 1]]
            }),
            posting: Object.assign({}, accountData.posting, {
                key_auths: [[newPublicKeys.posting, 1]]
            }),
            memo_key: newPublicKeys.memo
        };

        updatePassword(update, ownerKey)
            .then(() => {
                success(_t("password-update.updated"));
                onUpdate && onUpdate();
            })
            .catch((e) => {
                error(formatError(e));
            })
            .finally(() => {
                this.stateSet({inProgress: false});
            });
    }

    render() {
        const {activeUser} = this.props;
        const {curPass, newPass, newPass2, inProgress} = this.state;

        return <div className="dialog-content">
            <Form ref={this.form} onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (!this.form.current?.checkValidity()) {
                    return;
                }

                if (newPass !== newPass2) {
                    error(_t("password-update.error-new2"));
                    return;
                }

                this.update();
            }}>
                <Form.Group controlId="account-name">
                    <Form.Label>{_t("password-update.account")}</Form.Label>
                    <Form.Control type="text" readOnly={true} value={activeUser.username}/>
                </Form.Group>
                <Form.Group controlId="cur-pass">
                    <Form.Label>{_t("password-update.cur-pass")}</Form.Label>
                    <Form.Control 
                        value={curPass} 
                        onChange={this.curPassChanged} 
                        required={true} 
                        onInvalid={(e:any) => handleInvalid(e,"password-update.",'validation-password')}
                        onInput={handleOnInput}
                        type="password" 
                        autoFocus={true} 
                        autoComplete="off"
                    />
                </Form.Group>
                <Form.Group controlId="new-pass">
                    <Form.Label>{_t("password-update.new-pass")}</Form.Label>
                    <div>
                        {!newPass && (<Button variant="outline-primary" onClick={this.genWif}>{_t("password-update.pass-gen")}</Button>)}
                        {newPass && <code className="pass-generated">{newPass}</code>}
                    </div>
                </Form.Group>
                <Form.Group controlId="re-new-pass">
                    <Form.Label>{_t("password-update.new-pass2")}</Form.Label>
                    <Form.Control 
                        value={newPass2} 
                        onChange={this.newPass2Changed} 
                        required={true} 
                        type="password" 
                        autoComplete="off"
                        onInvalid={(e:any) => handleInvalid(e,"password-update.",'validation-password')}
                        onInput={handleOnInput}
                    />
                </Form.Group>
                <Form.Group controlId="accept">
                    <Form.Check 
                        required={true} 
                        type="checkbox" 
                        label={_t("password-update.label-check")}
                        onInvalid={(e: any) => handleInvalid(e, "password-update.", 'validation-label')}
                        onInput={handleOnInput}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={inProgress}>
                    {inProgress && (<Spinner animation="grow" variant="light" size="sm" style={{marginRight: "6px"}}/>)}
                    {_t("g.update")}
                </Button>
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


export default class PasswordUpdateDialog extends BaseComponent<DialogProps, DialogState> {
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
            <Button onClick={this.toggleDialog} size="sm">{keySvg} {_t('password-update.title')}</Button>

            {dialog && (
                <Modal show={true} centered={true} onHide={this.toggleDialog} animation={false} backdrop="static" keyboard={false} className="password-update-modal">
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{_t('password-update.title')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <PasswordUpdate {...this.props} onUpdate={this.toggleDialog}/>
                    </Modal.Body>
                </Modal>
            )}
        </>
    }
}

