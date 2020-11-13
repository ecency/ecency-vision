import React, {Component} from 'react';

import {Modal} from "react-bootstrap";

import {ActiveUser} from "../../store/active-user/types";
import {User} from "../../store/users/types";
import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {ToggleType, UI} from "../../store/ui/types";

import LoginRequired from "../login-required";
import KeyOrHot from "../key-or-hot";
import {error} from "../feedback";

import {witnessVote, witnessVoteHot, witnessVoteKc, formatError} from "../../api/operations";

import _c from "../../util/fix-class-names";

import {chevronUpSvg} from "../../img/svg";

interface Props {
    global: Global;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    signingKey: string;
    voted: boolean;
    witness: string;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    setSigningKey: (key: string) => void;
    onSuccess: (approve: boolean) => void;
}

interface State {
    inProgress: boolean;
    keyDialog: boolean;
}

export class WitnessVoteBtn extends Component <Props, State> {
    state: State = {
        inProgress: false,
        keyDialog: false,
    };

    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    toggleKeyDialog = () => {
        const {keyDialog} = this.state;
        this.stateSet({keyDialog: !keyDialog});
    }

    vote = (fn: any, args: any[]) => {
        const {voted, onSuccess} = this.props;
        const approve = !voted;
        const fnArgs = [...args, approve]
        const call = fn(...fnArgs);

        if (typeof call?.then === 'function') {
            this.stateSet({inProgress: true});

            call.then(() => {
                onSuccess(approve);
            }).catch((e: any) => {
                error(formatError(e));
            }).finally(() => {
                this.stateSet({inProgress: false});
            });
        }
    }

    render() {
        const {activeUser, voted, witness} = this.props;
        const {inProgress, keyDialog} = this.state;

        const cls = _c(`btn-witness-vote btn-up-vote ${inProgress ? 'in-progress' : ''} ${voted ? 'voted' : ''} ${witness === '' ? 'disabled' : ''}`);

        return <>
            {LoginRequired({
                ...this.props,
                children: <div className="witness-vote-btn" onClick={this.toggleKeyDialog}>
                    <div className={cls}>
                        <span className="btn-inner">{chevronUpSvg}</span>
                    </div>
                </div>
            })}

            {keyDialog && (
                <Modal animation={false} show={true} centered={true} onHide={this.toggleKeyDialog} keyboard={false} className="witness-vote-key-modal modal-thin-header">
                    <Modal.Header closeButton={true}/>
                    <Modal.Body>
                        {KeyOrHot({
                            ...this.props,
                            activeUser: activeUser!,
                            inProgress: false,
                            onKey: (key) => {
                                this.toggleKeyDialog();
                                this.vote(witnessVote, [activeUser!.username, key, witness]);
                            },
                            onHot: () => {
                                this.toggleKeyDialog();
                                this.vote(witnessVoteHot, [activeUser!.username, witness]);
                            },
                            onKc: () => {
                                this.toggleKeyDialog();
                                this.vote(witnessVoteKc, [activeUser!.username, witness]);
                            }
                        })}
                    </Modal.Body>
                </Modal>
            )}
        </>;
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
        voted: p.voted,
        witness: p.witness,
        onSuccess: p.onSuccess
    }

    return <WitnessVoteBtn {...props} />
}
