import React, {Component} from "react";

import {Button} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";
import {Account} from "../../store/accounts/types";

import KeyOrHotDialog from "../key-or-hot-dialog";
import LoginRequired from "../login-required";
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
    username: string;
    onSuccess: () => void;
}

interface State {
    inProgress: boolean;
}

export class WitnessesActiveProxy extends Component<Props, State> {
    state: State = {
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
        const {inProgress} = this.state;
        const {activeUser, username} = this.props;

        const btn = <Button disabled={inProgress}>{_t("witnesses-page.remove-proxy")}</Button>;
        const theBtn = activeUser ?
            KeyOrHotDialog({
                ...this.props,
                activeUser: activeUser!,
                children: btn,
                onKey: (key) => {
                    this.proxy(witnessProxy, [activeUser!.username, key, '']);
                },
                onHot: () => {
                    this.proxy(witnessProxyHot, [activeUser!.username, '']);
                },
                onKc: () => {
                    this.proxy(witnessProxyKc, [activeUser!.username, '']);
                }
            }) :
            LoginRequired({
                ...this.props,
                children: btn
            });

        return <div className="witnesses-active-proxy">
            <p className="description">
                {_t("witnesses-page.proxy-active-exp")}
            </p>
            <div className="proxy-form">
                <div className="current-proxy">
                    {_t("witnesses-page.current-proxy", {n: username})}
                </div>
                {theBtn}
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
        username: p.username,
        onSuccess: p.onSuccess
    }

    return <WitnessesActiveProxy {...props} />
}
