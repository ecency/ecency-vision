import {Dispatch} from "redux";

import {AppState} from "../index";
import {Reblog, Reblogs, Actions, ActionTypes, FetchAction, FetchedAction, AddAction, DeleteAction} from "./types";
import {ActionTypes as ActiveUserActionTypes} from "../active-user/types";

import {getBlogEntries} from "../../api/hive";

export const initialState: Reblogs = {
    list: [],
    canFetch: true
};

export default (state: Reblogs = initialState, action: Actions): Reblogs => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            return {
                ...state,
                list: [],
                canFetch: false
            };
        }
        case ActionTypes.FETCHED: {
            return {
                ...state,
                list: [...action.items],
            };
        }
        case ActionTypes.ADD: {
            const {item} = action;
            const newList = [...state.list, item];
            return {
                ...state,
                list: newList
            }
        }
        case ActionTypes.DELETE: {
            const {item} = action;
            const newList = state.list.filter(x => x.author !== item.author && x.permlink !== item.permlink)
            return {
                ...state,
                list: newList
            }
        }
        case ActiveUserActionTypes.LOGOUT: {
            return {...initialState}
        }
        default:
            return state;
    }
};

/* Actions */
export const fetchReblogs = () => (dispatch: Dispatch, getState: () => AppState) => {

    const {activeUser, reblogs} = getState();

    if (!activeUser || !reblogs.canFetch) {
        return;
    }

    dispatch(fetchAct());

    getBlogEntries(activeUser.username, 200).then(resp => {
        const items: Reblog[] = resp
            .filter(i => i.author !== activeUser.username && !i.reblogged_on.startsWith("1970-"))
            .map(i => ({author: i.author, permlink: i.permlink}));

        dispatch(fetchedAct(items));
    })
}

export const addReblog = (author: string, permlink: string) => (dispatch: Dispatch) => {
    dispatch(addAct({author, permlink}));
};

export const deleteReblog = (author: string, permlink: string) => (dispatch: Dispatch) => {
    dispatch(deleteAct({author, permlink}));
};

/* Action Creators */
export const fetchAct = (): FetchAction => {
    return {
        type: ActionTypes.FETCH,
    };
};

export const fetchedAct = (items: Reblog[]): FetchedAction => {
    return {
        type: ActionTypes.FETCHED,
        items
    };
};

export const addAct = (item: Reblog): AddAction => {
    return {
        type: ActionTypes.ADD,
        item
    };
};

export const deleteAct = (item: Reblog): DeleteAction => {
    return {
        type: ActionTypes.DELETE,
        item
    };
};

