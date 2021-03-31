import {Dispatch} from "redux";

import {Entry} from "../entries/types";
import {ActionTypes as ActiveUserActionTypes} from "../active-user/types";
import {AppState} from "../index";

import {EntryPinTracker, Actions, ActionTypes, FetchAction, SetAction} from "./types";

import {CommonActionTypes} from "../common";

import {getPostsRanked} from "../../api/bridge";


export const initialState: EntryPinTracker = {};

export default (state: EntryPinTracker = initialState, action: Actions): EntryPinTracker => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            const key = `${action.author}-${action.permlink}`;
            return {
                ...state,
                [key]: false,
            };
        }
        case ActionTypes.SET: {
            const key = `${action.author}-${action.permlink}`;
            return {
                ...state,
                [key]: action.pinned,
            };
        }
        case CommonActionTypes.LOCATION_CHANGE:
        case ActiveUserActionTypes.LOGIN:
        case ActiveUserActionTypes.LOGOUT: {
            return {...initialState}
        }
        default:
            return state;
    }
}

export const trackEntryPin = (entry: Entry) => (dispatch: Dispatch, getState: () => AppState) => {
    const {activeUser, entryPinTracker} = getState();

    if (!activeUser) {
        return;
    }

    const key = `${entry.author}-${entry.permlink}`;
    if (entryPinTracker[key] !== undefined) {
        return;
    }

    if (!entry.community_title) {
        return;
    }

    dispatch(fetchAct(entry));

    getPostsRanked("created", "", "", 20, entry.category)
        .then(r => {
            if (r) {
                const isPinned = r.find(x => x.author === entry.author && x.permlink === entry.permlink && x.stats?.is_pinned === true) !== undefined;
                dispatch(setAct(entry, isPinned));
                return;
            }

            dispatch(setAct(entry, false));
        })
        .catch(() => {
            dispatch(setAct(entry, false));
        });
}

export const setEntryPin = (entry: Entry, pin: boolean) => (dispatch: Dispatch) => {
    dispatch(setAct(entry, pin));
}

/* Action Creators */
export const fetchAct = (entry: Entry): FetchAction => {
    return {
        type: ActionTypes.FETCH,
        author: entry.author,
        permlink: entry.permlink
    };
};

export const setAct = (entry: Entry, pinned: boolean): SetAction => {
    return {
        type: ActionTypes.SET,
        author: entry.author,
        permlink: entry.permlink,
        pinned
    };
};
