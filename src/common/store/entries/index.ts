import update from 'immutability-helper';

import {Dispatch} from 'redux';

import {AppState} from '../index';

import {Actions, ActionTypes, FetchAction, FetchErrorAction, FetchedAction, InvalidateAction, State, Entry} from './types';

import {CommonActionTypes} from '../common';

import filterTagExtract from '../../helper/filter-tag-extract';

import {getPostsRanked} from '../../api/hive';

export const makeGroupKey = (what: string, tag: string = ''): string => {
    if (tag) {
        return `${what}-${tag}`;
    }
    return `${what}`;
};

export const initialState: State = {};

export default (state: State = initialState, action: Actions): State => {
    switch (action.type) {
        case CommonActionTypes.LOCATION_CHANGE: {
            const {pathname} = action.payload.location;
            const params = filterTagExtract(pathname);

            if (!params) {
                return state;
            }

            const {filter, tag} = params;
            const groupKey = makeGroupKey(filter, tag);

            if (state[`${groupKey}`] === undefined) {
                return update(state, {
                    [`${groupKey}`]: {$set: {entries: [], error: null, loading: false, hasMore: false}}
                });
            }

            return state
        }
        case ActionTypes.FETCH: {
            const {groupKey} = action;
            return update(state, {[`${groupKey}`]: {$merge: {loading: true, error: null}}});
        }
        case ActionTypes.FETCH_ERROR: {
            const {groupKey, error} = action;
            return update(state, {[`${groupKey}`]: {$merge: {loading: false, error}}});
        }
        case ActionTypes.FETCHED: {
            const {groupKey, entries, hasMore} = action;

            const merged = update(state, {[`${groupKey}`]: {$merge: {loading: false, error: null, hasMore}}});

            // Filter entries
            const newEntries = entries.filter(x => {
                return state[groupKey].entries.find(y => y.author == x.author && y.permlink == x.permlink) === undefined
            });

            return update(merged, {[`${groupKey}`]: {entries: {$push: newEntries}}});
        }
        case ActionTypes.INVALIDATE: {
            const {groupKey} = action;

            return update(state, {[`${groupKey}`]: {$merge: {entries: [], loading: false, error: null, hasMore: false}}});
        }
        default:
            return state;
    }
}


/* Actions */
export const fetchEntries = (what: string = '', tag: string = '', more: boolean = false) =>
    (dispatch: Dispatch, getState: () => AppState) => {
        const {entries} = getState();
        const pageSize = 20;

        const groupKey = makeGroupKey(what, tag);

        const theEntries = entries[groupKey].entries;

        if (!more && theEntries.length > 0) {
            return;
        }

        const lastEntry = theEntries.pop();

        let start_author = '';
        let start_permlink = '';

        if (lastEntry) {
            start_author = lastEntry.author;
            start_permlink = lastEntry.permlink;
        }

        dispatch(fetchAct(groupKey));

        // TODO: get_account_posts will be used for account posts

        getPostsRanked(what, start_author, start_permlink, pageSize, tag).then(resp => {
            dispatch(fetchedAct(groupKey, resp, resp.length >= pageSize));
        }).catch((e) => {
            dispatch(fetchErrorAct(groupKey, e));
        });
    };

/* Action Creators */

export const fetchAct = (groupKey: string): FetchAction => {
    return {
        type: ActionTypes.FETCH,
        groupKey
    }
};

export const fetchErrorAct = (groupKey: string, error: Error): FetchErrorAction => {
    return {
        type: ActionTypes.FETCH_ERROR,
        groupKey,
        error
    }
};

export const fetchedAct = (groupKey: string, entries: Entry[], hasMore: boolean): FetchedAction => {
    return {
        type: ActionTypes.FETCHED,
        groupKey,
        entries,
        hasMore
    }
};

export const invalidateAct = (groupKey: string): InvalidateAction => {
    return {
        type: ActionTypes.INVALIDATE,
        groupKey
    }
};
