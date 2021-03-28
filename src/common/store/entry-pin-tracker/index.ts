import {Dispatch} from "redux";

import {Entry} from "../entries/types";
import {ActionTypes as ActiveUserActionTypes} from "../active-user/types";
import {AppState} from "../index";

import {EntryPinTracker, Actions, ActionTypes, FetchAction, SetAction} from "./types";

import {CommonActionTypes} from "../common";

import {getPostsRanked} from "../../api/bridge";


export const initialState: EntryPinTracker = {
    pinned: false,
    canFetch: true
};

export default (state: EntryPinTracker = initialState, action: Actions): EntryPinTracker => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            return {
                ...state,
                pinned: false,
                canFetch: false
            };
        }
        case ActionTypes.SET: {
            return {
                ...state,
                pinned: action.pinned,
                canFetch: true
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

    if (!activeUser || !entryPinTracker.canFetch) {
        return;
    }

    if (!entry.community_title) {
        return;
    }

    dispatch(fetchAct());

    getPostsRanked("created", "", "", 20, entry.category)
        .then(r => {
            if (r) {
                const isPinned = r.find(x => x.author === entry.author && x.permlink === entry.permlink && x.stats?.is_pinned === true) !== undefined;
                dispatch(setAct(isPinned));
                return;
            }

            dispatch(setAct(false));
        })
        .catch(() => {
            dispatch(setAct(false));
        });
}

/* Action Creators */
export const fetchAct = (): FetchAction => {
    return {
        type: ActionTypes.FETCH,
    };
};

export const setAct = (pinned: boolean): SetAction => {
    return {
        type: ActionTypes.SET,
        pinned
    };
};
