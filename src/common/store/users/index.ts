import { Dispatch } from "redux";

import { User, Actions, AddAction, RefreshAction, ActionTypes } from "./types";

import * as ls from "../../util/local-storage";

export const initialState: User[] = [];

export default (state: User[] = initialState, action: Actions): User[] => {
  switch (action.type) {
    case ActionTypes.ADD:
    case ActionTypes.REFRESH: {
      return ls.getByPrefix("user_") as User[];
    }
    default:
      return state;
  }
};

/* Actions */
export const addUser = (user: User) => async (dispatch: Dispatch) => {
  ls.set(`user_${user.username}`, user);
  dispatch(addAct(user));
};

export const deleteUser = (username: string) => async (dispatch: Dispatch) => {
  ls.remove(`user_${username}`);
  dispatch(refreshAct());
};

/* Action Creators */
export const addAct = (user: User): AddAction => {
  return {
    type: ActionTypes.ADD,
    user,
  };
};

export const refreshAct = (): RefreshAction => {
  return {
    type: ActionTypes.REFRESH,
  };
};
