import {Dispatch} from "redux";

import {
    UI, Actions,
    ToggleLoginAct,
    ToggleLoginKcAct,
    ToggleNotificationsAct,
    ActionTypes,
    ToggleType
} from "./types";

export const initialState: UI = {
    login: false,
    loginKc: false,
    notifications: false
};

export default (state: UI = initialState, action: Actions): UI => {
    switch (action.type) {
        case ActionTypes.TOGGLE_LOGIN: {
            const {login} = state;
            return {...state, login: !login}
        }
        case ActionTypes.TOGGLE_LOGIN_KC: {
            const {loginKc} = state;
            return {...state, loginKc: !loginKc}
        }
        case ActionTypes.TOGGLE_NOTIFICATIONS: {
            const {notifications} = state;
            return {...state, notifications: !notifications}
        }
        default:
            return state;
    }
};


/* Actions */
export const toggleUIProp = (what: ToggleType) => (dispatch: Dispatch) => {
    switch (what) {
        case "login":
            dispatch(toggleLoginAct());
            break;
        case "loginKc":
            dispatch(toggleLoginKcAct());
            break;
        case "notifications":
            dispatch(toggleNotificationsAct());
            break;
        default:
            break;
    }
};


export const toggleLoginAct = (): ToggleLoginAct => {
    return {
        type: ActionTypes.TOGGLE_LOGIN,
    };
};

export const toggleLoginKcAct = (): ToggleLoginKcAct => {
    return {
        type: ActionTypes.TOGGLE_LOGIN_KC,
    };
};

export const toggleNotificationsAct = (): ToggleNotificationsAct => {
    return {
        type: ActionTypes.TOGGLE_NOTIFICATIONS,
    };
};
