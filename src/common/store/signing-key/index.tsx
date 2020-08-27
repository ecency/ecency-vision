import {Dispatch} from "redux";

import {
    Actions,
    ActionTypes,
    SetAction
} from "./types";


export const initialState: string = '';

export default (state: string = initialState, action: Actions): string => {
    switch (action.type) {
        case ActionTypes.SET: {
            return action.key;
        }
        default:
            return state;
    }
};

/* Actions */
export const setSigningKey = (key: string) => (dispatch: Dispatch) => {
    dispatch(setAct(key));
};

/* Action Creators */
export const setAct = (key: string): SetAction => {
    return {
        type: ActionTypes.SET,
        key,
    };
};
