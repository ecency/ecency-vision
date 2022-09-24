import {Dispatch} from "redux";

import {User, Actions, AddAction, ReloadAction, ActionTypes} from "./types";

import * as ls from "../../util/local-storage";

import {encodeObj, decodeObj} from "../../util/encoder";

export const initialState: User[] = [];

export default (state: User[] = initialState, action: Actions): User[] => {
    switch (action.type) {
        case ActionTypes.ADD:
        case ActionTypes.RELOAD: {
            return ls.getByPrefix("user_").map((x) => {
                const u = decodeObj(x) as User;
                return {
                    username: u.username,
                    refreshToken: '',
                    accessToken: '',
                    expiresIn: u.expiresIn,
                    postingKey: u.postingKey
                }
            });
        }
        default:
            return state;
    }
};

/* Actions */
export const addUser = (user: User) => async (dispatch: Dispatch) => {
    ls.set(`user_${user.username}`, encodeObj(user));
    dispatch(addAct(user));
};

export const deleteUser = (username: string) => async (dispatch: Dispatch) => {
    ls.remove(`user_${username}`);
    dispatch(reloadAct());
};

/* Action Creators */
export const addAct = (user: User): AddAction => {
    return {
        type: ActionTypes.ADD,
        user,
    };
};

export const reloadAct = (): ReloadAction => {
    return {
        type: ActionTypes.RELOAD,
    };
};
