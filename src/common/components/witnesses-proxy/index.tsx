import React, {Component} from 'react';

import {Button, FormControl, Modal} from "react-bootstrap";

import {_t} from "../../i18n";
import LoginRequired from "../login-required";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";
import {Account} from "../../store/accounts/types";
import KeyOrHot from "../key-or-hot";
import {formatError, witnessProxy, witnessProxyHot, witnessProxyKc} from "../../api/operations";
import {error} from "../feedback";

interface Props {
    global: Global;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    signingKey: string;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    setSigningKey: (key: string) => void;
    onSuccess: () => void;
}

interface State {
    username: string;
    inProgress: boolean;
    keyDialog: boolean;
}

export class WitnessesProxy extends Component<Props, State> {
    state: State = {
        username: '',
        inProgress: false,
        keyDialog: false
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

    usernameChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        this.stateSet({username: e.target.value.trim()});
    }

    toggleKeyDialog = () => {
        const {keyDialog} = this.state;
        this.stateSet({keyDialog: !keyDialog});
    }

    proxy = (fn: any, args: any[]) => {
        const {onSuccess} = this.props;
        const fnArgs = [...args]
        const call = fn(...fnArgs);

        if (typeof call?.then === 'function') {
            this.stateSet({inProgress: true});

            call.then(() => {
                onSuccess();
            }).catch((e: any) => {
                error(formatError(e));
            }).finally(() => {
                this.stateSet({inProgress: false});
            });
        }
    }

    render() {
        const {activeUser} = this.props;
        const {username, inProgress, keyDialog} = this.state;

        return <div className="witnesses-proxy">
            <p className="description">
                {_t("witnesses-page.proxy-exp")}
            </p>

            <div className="proxy-form">
                <div className="txt-username">
                    <FormControl
                        type="text"
                        placeholder={_t("witnesses-page.username-placeholder")}
                        value={username}
                        maxLength={20}
                        onChange={this.usernameChanged}
                        disabled={inProgress}/>
                </div>
                <div>
                    {LoginRequired({
                        ...this.props,
                        children: <Button onClick={this.toggleKeyDialog}>{_t("witnesses-page.set-proxy")}</Button>
                    })}
                </div>
            </div>

            {keyDialog && (
                <Modal animation={false} show={true} centered={true} onHide={this.toggleKeyDialog} keyboard={false} className="witness-proxy-modal modal-thin-header">
                    <Modal.Header closeButton={true}/>
                    <Modal.Body>
                        {KeyOrHot({
                            ...this.props,
                            activeUser: activeUser!,
                            inProgress: false,
                            onKey: (key) => {
                                this.toggleKeyDialog();
                                this.proxy(witnessProxy, [activeUser!.username, key, username]);
                            },
                            onHot: () => {
                                this.toggleKeyDialog();
                                this.proxy(witnessProxyHot, [activeUser!.username, username]);
                            },
                            onKc: () => {
                                this.toggleKeyDialog();
                                this.proxy(witnessProxyKc, [activeUser!.username, username]);
                            }
                        })}
                    </Modal.Body>
                </Modal>
            )}
        </div>
    }
}

export default (p: Props) => {
    const props: Props = {
        global: p.global,
        users: p.users,
        activeUser: p.activeUser,
        ui: p.ui,
        signingKey: p.signingKey,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        toggleUIProp: p.toggleUIProp,
        setSigningKey: p.setSigningKey,
        onSuccess: p.onSuccess
    }

    return <WitnessesProxy {...props} />
}
