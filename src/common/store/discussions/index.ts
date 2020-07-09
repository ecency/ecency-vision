import {Dispatch} from "redux";

import {Entry} from "../entries/types";

import {
    Discussions,
    Actions,
    ActionTypes,
    FetchAction,
    FetchedAction,
    FetchErrorAction,
    ResetAction,
} from "./types";

import {getDiscussion} from "../../api/bridge";

export const initialState: Discussions = {
    list: {},
    loading: false,
    error: false,
};

export default (state: Discussions = initialState, action: Actions): Discussions => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            return {
                list: {},
                loading: true,
                error: false,
            };
        }
        case ActionTypes.FETCHED: {
            return {
                list: action.list,
                loading: false,
                error: false,
            };
        }
        case ActionTypes.FETCH_ERROR: {
            return {
                list: {},
                loading: false,
                error: true,
            };
        }
        case ActionTypes.RESET: {
            return {...initialState};
        }
        default:
            return state;
    }
};

/* Actions */
export const fetchDiscussions = (parent_author: string, parent_permlink: string) => (dispatch: Dispatch) => {
    dispatch(fetchAct());

    getDiscussion(parent_author, parent_permlink)
        .then((r) => {
            if (r) {
                dispatch(fetchedAct(r));
            } else {
                dispatch(fetchErrorAct());
            }
        })
        .catch(() => {
            dispatch(fetchErrorAct());
        });
};

export const resetDiscussions = () => (dispatch: Dispatch) => {
    dispatch(resetAct());
};

/* Action Creators */
export const fetchAct = (): FetchAction => {
    return {
        type: ActionTypes.FETCH,
    };
};

export const fetchedAct = (list: Record<string, Entry>): FetchedAction => {
    return {
        type: ActionTypes.FETCHED,
        list,
    };
};

export const fetchErrorAct = (): FetchErrorAction => {
    return {
        type: ActionTypes.FETCH_ERROR,
    };
};

export const resetAct = (): ResetAction => {
    return {
        type: ActionTypes.RESET,
    };
};
