import React, {Component} from "react";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType, UI} from "../../store/ui/types";
import {Account} from "../../store/accounts/types";

import LoginRequired from "../login-required";
import KeyOrHotDialog from "../key-or-hot-dialog";

import {getProposalVotes} from "../../api/hive";

import {proposalVote, proposalVoteHot, proposalVoteKc, formatError} from "../../api/operations";

import _c from "../../util/fix-class-names";

import {chevronUpSvg} from "../../img/svg";
import {error} from "../feedback";

interface Props {
    global: Global;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    signingKey: string;
    proposal: number;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    setSigningKey: (key: string) => void;
}

interface State {
    loading: false;
    inProgress: boolean;
    voted: boolean;
}

export class ProposalVoteBtn extends Component <Props, State> {
    state: State = {
        loading: false,
        inProgress: false,
        voted: false
    };

    _mounted: boolean = true;

    componentDidMount() {
        this.load();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };


    load = () => {
        const {proposal, activeUser} = this.props;
        if (!activeUser) {
            return;
        }

        this.stateSet({loading: true});
        getProposalVotes(proposal, activeUser.username, 1).then(r => {
            const voted = r.length > 0 && r[0].voter === activeUser.username;
            this.stateSet({voted});
        }).finally(() => this.stateSet({loading: false}))
    }

    vote = (fn: any, args: any[]) => {
        const {voted} = this.state;
        const approve = !voted;
        const fnArgs = [...args, approve]
        const call = fn(...fnArgs);

        if (typeof call?.then === 'function') {
            this.stateSet({inProgress: true});

            call.then(() => {
                this.stateSet({voted: approve});
            }).catch((e: any) => {
                error(formatError(e));
            }).finally(() => {
                this.stateSet({inProgress: false});
            });
        }
    }

    render() {
        const {activeUser, proposal} = this.props;
        const {loading, inProgress, voted} = this.state;

        const cls = _c(`btn-witness-vote btn-up-vote vote-btn-lg ${(inProgress || loading) ? 'in-progress' : ''} ${voted ? 'voted' : ''}`);
        const btn = <div className="witness-vote-btn">
            <div className={cls}>
                <span className="btn-inner">{chevronUpSvg}</span>
            </div>
        </div>;

        if (!activeUser) {
            return LoginRequired({
                ...this.props,
                children: btn
            });
        }

        return KeyOrHotDialog({
            ...this.props,
            activeUser: activeUser!,
            children: btn,
            onKey: (key) => {
                this.vote(proposalVote, [activeUser!.username, key, proposal]);
            },
            onHot: () => {
                this.vote(proposalVoteHot, [activeUser!.username, proposal]);
            },
            onKc: () => {
                this.vote(proposalVoteKc, [activeUser!.username, proposal]);
            }
        });
    }
}

export default (p: Props) => {
    const props: Props = {
        global: p.global,
        users: p.users,
        activeUser: p.activeUser,
        ui: p.ui,
        signingKey: p.signingKey,
        proposal: p.proposal,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        toggleUIProp: p.toggleUIProp,
        setSigningKey: p.setSigningKey,
    }

    return <ProposalVoteBtn {...props} />
}
