import {Dispatch} from "redux";

import {Account} from "../accounts/types";
import {Actions, ActionTypes, ActiveUser, LoginAction, LogoutAction, UpdateAction} from "./types";

import * as ls from "../../util/local-storage";

const load = (): ActiveUser | null => {
    const name = ls.get("active_user");
    if (name && ls.get(`user_${name}`)) {
        return {
            username: name,
            data: {name},
        };
    }

    return null;
};

export const initialState: ActiveUser | null = null;

export default (state: ActiveUser | null = initialState, action: Actions): ActiveUser | null => {
    switch (action.type) {
        case ActionTypes.LOGIN:
        case ActionTypes.LOGOUT: {
            return load();
        }
        case ActionTypes.UPDATE: {
            const {data} = action;
            return Object.assign({}, state, {data});
        }
        default:
            return state;
    }
};

/* Actions */
export const setActiveUser = (name: string | null) => async (dispatch: Dispatch) => {
    if (name) {
        ls.set("active_user", name);
        dispatch(loginAct());
    } else {
        ls.remove("active_user");
        dispatch(logoutAct());
    }
};

export const updateActiveUser = (data: Account) => async (dispatch: Dispatch) => {
    dispatch(updateAct(data));
};

/* Action Creators */
export const loginAct = (): LoginAction => {
    return {
        type: ActionTypes.LOGIN,
    };
};

export const logoutAct = (): LogoutAction => {
    return {
        type: ActionTypes.LOGOUT,
    };
};

export const updateAct = (data: Account): UpdateAction => {
    return {
        type: ActionTypes.UPDATE,
        data,
    };
};
