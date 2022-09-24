import {Dispatch} from "redux";

import Cookies from "js-cookie";

import {AppState} from "../index";
import {Account} from "../accounts/types";
import {Actions, ActionTypes, ActiveUser, UserPoints, LoginAction, LogoutAction, UpdateAction} from "./types";

import * as ls from "../../util/local-storage";

import {getAccount} from "../../api/hive";
import {getPoints} from "../../api/private-api";

import {activeUserMaker} from "../helper";

const load = (): ActiveUser | null => {
    const name = ls.get("active_user");
    if (name && ls.get(`user_${name}`)) {
        return activeUserMaker(name);
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
            const {data, points} = action;
            return Object.assign({}, state, {data, points});
        }
        default:
            return state;
    }
};

/* Actions */
export const setActiveUser = (name: string | null) => async (dispatch: Dispatch) => {
    if (name) {
        ls.set("active_user", name);
        Cookies.set("active_user", name);
        dispatch(loginAct());
    } else {
        ls.remove("active_user");
        Cookies.remove("active_user");
        dispatch(logoutAct());
    }
};

export const updateActiveUser = (data?: Account) => async (dispatch: Dispatch, getState: () => AppState) => {
    const {activeUser} = getState();
    if (!activeUser) {
        return;
    }

    let uData: Account | undefined = data;
    if (!uData) {
        try {
            uData = await getAccount(activeUser.username);
        } catch (e) {
            uData = {
                name: activeUser.username
            }
        }
    }

    let points: UserPoints;
    try {
        const r = await getPoints(activeUser.username)
        points = {
            points: r.points,
            uPoints: r.unclaimed_points
        }
    } catch (e) {
        points = {
            points: "0.000",
            uPoints: "0.000"
        }
    }

    dispatch(updateAct(uData, points));
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

export const updateAct = (data: Account, points: UserPoints): UpdateAction => {
    return {
        type: ActionTypes.UPDATE,
        data,
        points
    };
};
