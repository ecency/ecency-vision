import React, {Component} from "react";
import {History, Location} from "history";

import isEqual from "react-fast-compare";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Entry} from "../../store/entries/types";
import {Community} from "../../store/community/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Reblog} from "../../store/reblogs/types";
import {UI, ToggleType} from "../../store/ui/types";

import EntryListItem from "../entry-list-item/index";

interface Props {
    history: History;
    location: Location;
    global: Global;
    dynamicProps: DynamicProps;
    entries: Entry[];
    promotedEntries: Entry[];
    community?: Community | null;
    users: User[];
    activeUser: ActiveUser | null;
    reblogs: Reblog[];
    ui: UI;
    addAccount: (data: Account) => void;
    updateEntry: (entry: Entry) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    addReblog: (account: string, author: string, permlink: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class EntryListContent extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
        return (
            !isEqual(this.props.entries, nextProps.entries) ||
            !isEqual(this.props.community, nextProps.community) ||
            !isEqual(this.props.global, nextProps.global) ||
            !isEqual(this.props.dynamicProps, nextProps.dynamicProps) ||
            !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username) ||
            !isEqual(this.props.reblogs, nextProps.reblogs)
        );
    }

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
