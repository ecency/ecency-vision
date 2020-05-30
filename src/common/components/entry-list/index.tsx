import React, {Component} from 'react';
import {History, Location} from 'history';

import isEqual from 'react-fast-compare';

import {State as GlobalState} from '../../store/global/types';

import {Entry} from '../../store/entries/types';
import EntryListItem from '../entry-list-item/index';

interface Props {
    history: History,
    location: Location,
    global: GlobalState,
    entries: Entry[]
}

export default class EntryListContent extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
        return !isEqual(this.props.entries, nextProps.entries)
            || !isEqual(this.props.global, nextProps.global);
    }

    render() {
        const {entries} = this.props;

        return (
            <>
                {entries.map(e => <EntryListItem key={`${e.author}-${e.permlink}`} {...this.props} entry={e}/>)}
            </>
        )
    }
}
