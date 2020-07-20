import {Dispatch} from "redux";

import {UI, Actions, ToggleLoginAct, ToggleSignUpAct, ActionTypes, ToggleType} from "./types";

export const initialState: UI = {
    login: false,
    signUp: false
};

export default (state: UI = initialState, action: Actions): UI => {
    switch (action.type) {
        case ActionTypes.TOGGLE_LOGIN:
            const {login} = state;
            return {...state, login: !login}
        case ActionTypes.TOGGLE_SIGN_UP:
            const {signUp} = state;
            return {...state, signUp: !signUp}
        default:
            return state;
    }
};


/* Actions */
export const toggleUIProp = (what: ToggleType) => (dispatch: Dispatch) => {
    switch (what) {
        case 'login':
            dispatch(toggleLoginAct());
            break;
        case "signUp":
            dispatch(toggleSignUpAct());
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

export const toggleSignUpAct = (): ToggleSignUpAct => {
    return {
        type: ActionTypes.TOGGLE_SIGN_UP,
    };
};
