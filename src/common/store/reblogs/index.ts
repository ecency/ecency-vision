import {Dispatch} from "redux";

import {Reblog, Actions, ActionTypes, ReloadAction} from "./types";

import * as ls from "../../util/local-storage";

const load = (): Reblog[] => {
    return ls.get("reblogs") || [];
};

export const initialState: Reblog[] = [];

export default (state: Reblog[] = initialState, action: Actions): Reblog[] => {
    switch (action.type) {
        case ActionTypes.RELOAD: {
            return load();
        }
        default:
            return state;
    }
};

/* Actions */
export const addReblog = (account: string, author: string, permlink: string) => (dispatch: Dispatch) => {
    const data: Reblog[] = [...(ls.get("reblogs") || []), {account, author, permlink}];
    ls.set("reblogs", data);
    dispatch(reloadAct());
};

export const deleteReblog = (account: string, author: string, permlink: string) => (dispatch: Dispatch) => {
    const data: Reblog[] = [...(ls.get("reblogs") || [])].filter(x => !(x.account === account && x.author === author && x.permlink === permlink))
    ls.set("reblogs", data);
    dispatch(reloadAct());
};

/* Action Creators */
export const reloadAct = (): ReloadAction => {
    return {
        type: ActionTypes.RELOAD,
    };
};
