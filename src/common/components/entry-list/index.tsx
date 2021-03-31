import React, {Component} from "react";
import {History, Location} from "history";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Entry} from "../../store/entries/types";
import {Community, Communities} from "../../store/communities/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Reblogs} from "../../store/reblogs/types";
import {UI, ToggleType} from "../../store/ui/types";

import EntryListItem from "../entry-list-item/index";
import {EntryPinTracker} from "../../store/entry-pin-tracker/types";

interface Props {
    history: History;
    location: Location;
    global: Global;
    dynamicProps: DynamicProps;
    entries: Entry[];
    promotedEntries: Entry[];
    communities: Communities;
    community?: Community | null;
    users: User[];
    activeUser: ActiveUser | null;
    reblogs: Reblogs;
    ui: UI;
    entryPinTracker: EntryPinTracker;
    signingKey: string;
    addAccount: (data: Account) => void;
    updateEntry: (entry: Entry) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    fetchReblogs: () => void;
    addReblog: (author: string, permlink: string) => void;
    deleteReblog: (author: string, permlink: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    addCommunity: (data: Community) => void;
    trackEntryPin: (entry: Entry) => void;
    setSigningKey: (key: string) => void;
    setEntryPin: (pin: boolean) => void;
}

export class EntryListContent extends Component<Props> {
    render() {
        const {entries, promotedEntries} = this.props;

        return (
            <>
                {entries.map((e, i) => {
                    const l = [];

                    if (i % 3 === 0 && i > 0) {
                        const ix = i / 3 - 1;

                        if (promotedEntries[ix]) {
                            const p = promotedEntries[ix];

                            if (!entries.find(x => x.author === p.author && x.permlink === p.permlink)) {
                                l.push(
                                    <EntryListItem
                                        key={`${p.author}-${p.permlink}`}
                                        {...Object.assign({}, this.props, {entry: p})}
                                        promoted={true}
                                    />
                                );
                            }
                        }
                    }

                    l.push(<EntryListItem key={`${e.author}-${e.permlink}`} {...this.props} entry={e}/>);
                    return [...l];
                })}
            </>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        location: p.location,
        global: p.global,
        dynamicProps: p.dynamicProps,
        entries: p.entries,
        promotedEntries: p.promotedEntries,
        communities: p.communities,
        community: p.community,
        users: p.users,
        activeUser: p.activeUser,
        reblogs: p.reblogs,
        ui: p.ui,
        entryPinTracker: p.entryPinTracker,
        signingKey: p.signingKey,
        addAccount: p.addAccount,
        updateEntry: p.updateEntry,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        fetchReblogs: p.fetchReblogs,
        addReblog: p.addReblog,
        deleteReblog: p.deleteReblog,
        toggleUIProp: p.toggleUIProp,
        addCommunity: p.addCommunity,
        trackEntryPin: p.trackEntryPin,
        setSigningKey: p.setSigningKey,
        setEntryPin: p.setEntryPin,
    }

    return <EntryListContent {...props} />;
}
