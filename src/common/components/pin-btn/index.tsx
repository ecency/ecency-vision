import React, {Component} from "react";

import isEqual from "react-fast-compare";

import {Entry, EntryStat} from "../../store/entries/types";
import {Community} from "../../store/communities/types";
import {ActiveUser} from "../../store/active-user/types";
import {clone} from "../../store/util";

import PopoverConfirm from "../popover-confirm";

import {formatError, pinPost} from "../../api/operations";
import {error} from "../feedback";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

interface Props {
    entry: Entry;
    community: Community;
    activeUser: ActiveUser;
    onSuccess: (entry: Entry) => void;
}

interface State {
    inProgress: boolean
}

export class PinBtn extends Component<Props, State> {
    state: State = {
        inProgress: false
    }

    _mounted: boolean = true;

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.state, nextState) ||
            !isEqual(this.props.entry, nextProps.entry) ||
            !isEqual(this.props.community, nextProps.community) ||
            !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username)
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    pin = (pin: boolean) => {
        const {entry, community, activeUser, onSuccess} = this.props;

        this.stateSet({inProgress: true});

        pinPost(activeUser.username, community.name, entry.author, entry.permlink, pin)
            .then(() => {
                const nStats: EntryStat = {...clone(entry.stats), is_pinned: pin}
                const nEntry: Entry = {...clone(entry), stats: nStats};
                onSuccess(nEntry);
            })
            .catch(err => error(formatError(err)))
            .finally(() => this.stateSet({inProgress: false}));
    }

    render() {
        const {entry} = this.props;
        const {inProgress} = this.state;
        const isPinned = !!entry.stats?.is_pinned;

        const cls = _c(`pin-btn ${inProgress ? "in-progress" : ""}`);

        if (isPinned) {
            return <a href="#" className={cls} onClick={(e) => {
                e.preventDefault();
            }}>
                <PopoverConfirm onConfirm={() => {
                    this.pin(false);
                }}>
                    <span>{_t("pin-btn.unpin")}</span>
                </PopoverConfirm>
            </a>
        }

        return <a href="#" className={cls} onClick={(e) => {
            e.preventDefault();
        }}>
            <PopoverConfirm onConfirm={() => {
                this.pin(true);
            }}>
                <span>{_t("pin-btn.pin")}</span>
            </PopoverConfirm>
        </a>
    }
}

export default (p: Props) => {
    const props = {
        entry: p.entry,
        community: p.community,
        activeUser: p.activeUser,
        onSuccess: p.onSuccess
    }

    return <PinBtn {...props} />;
}
