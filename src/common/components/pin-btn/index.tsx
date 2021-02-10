import React from "react";

import isEqual from "react-fast-compare";

import {Entry} from "../../store/entries/types";
import {Community} from "../../store/communities/types";
import {ActiveUser} from "../../store/active-user/types";

import BaseComponent from "../base";
import PopoverConfirm from "../popover-confirm";

import {formatError, pinPost} from "../../api/operations";
import {error} from "../feedback";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

import {getPostsRanked} from "../../api/bridge";

interface Props {
    entry: Entry;
    community: Community;
    activeUser: ActiveUser;
    onSuccess: (entry: Entry) => void;
}

interface State {
    inProgress: boolean,
    isPinned: boolean,
    loading: boolean,
}

export class PinBtn extends BaseComponent<Props, State> {
    state: State = {
        inProgress: false,
        isPinned: false,
        loading: false
    }

    componentDidMount() {
        const {community, entry} = this.props;

        this.stateSet({loading: true});
        getPostsRanked("created", "", "", 20, community.name).then(r => {
            if (r) {
                const isPinned = r.find(x => x.author === entry.author && x.permlink === entry.permlink && x.stats?.is_pinned === true) !== undefined;
                this.stateSet({isPinned});
            }

        }).finally(() => {
            this.stateSet({loading: false});
        })
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.state, nextState) ||
            !isEqual(this.props.entry, nextProps.entry) ||
            !isEqual(this.props.community, nextProps.community) ||
            !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username)
    }

    pin = (pin: boolean) => {
        const {entry, community, activeUser, onSuccess} = this.props;

        this.stateSet({inProgress: true});
        pinPost(activeUser.username, community.name, entry.author, entry.permlink, pin)
            .then(() => {
                this.stateSet({isPinned: pin});
                onSuccess(entry);
            })
            .catch(err => error(formatError(err)))
            .finally(() => this.stateSet({inProgress: false}));
    }

    render() {
        const {inProgress, loading, isPinned} = this.state;

        const cls = _c(`pin-btn ${(inProgress || loading) ? "in-progress" : ""}`);

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
