import React, {Component} from 'react';

import {Button, FormControl} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";
import {Account} from "../../store/accounts/types";

import LoginRequired from "../login-required";
import KeyOrHotDialog from "../key-or-hot-dialog";
import {error} from "../feedback";

import {formatError, witnessProxy, witnessProxyHot, witnessProxyKc} from "../../api/operations";

import {_t} from "../../i18n";

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
    onDone: (username: string) => void;
}

interface State {
    username: string;
    inProgress: boolean;
}

export class WitnessesProxy extends Component<Props, State> {
    state: State = {
        username: '',
        inProgress: false
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

    proxy = (fn: any, args: any[]) => {
        const {username} = this.state;
        const {onDone} = this.props;
        const fnArgs = [...args]
        const call = fn(...fnArgs);

        if (typeof call?.then === 'function') {
            this.stateSet({inProgress: true});

            call.then(() => {
                onDone(username);
            }).catch((e: any) => {
                error(formatError(e));
            }).finally(() => {
                this.stateSet({inProgress: false});
            });
        }
    }

    render() {
        const {activeUser} = this.props;
        const {username, inProgress} = this.state;

        const btn = <Button disabled={inProgress}>{_t("witnesses-page.set-proxy")}</Button>;
        const theBtn = activeUser ?
            KeyOrHotDialog({
                ...this.props,
                activeUser: activeUser!,
                children: btn,
                onKey: (key) => {
                    this.proxy(witnessProxy, [activeUser!.username, key, username]);
                },
                onHot: () => {
                    this.proxy(witnessProxyHot, [activeUser!.username, username]);
                },
                onKc: () => {
                    this.proxy(witnessProxyKc, [activeUser!.username, username]);
                }
            }) :
            LoginRequired({
                ...this.props,
                children: btn
            });

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
                <div>{theBtn}</div>
            </div>
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
        onDone: p.onDone
    }

    return <WitnessesProxy {...props} />
}
