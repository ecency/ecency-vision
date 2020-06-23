import { Dispatch } from "redux";

import { Account } from "../accounts/types";
import { ActiveUser, Actions, ReloadAction, UpdateAction, ActionTypes } from "./types";

import * as ls from "../../util/local-storage";

const load = (): ActiveUser | null => {
  const name = ls.get("active_user");
  if (name && ls.get(`user_${name}`)) {
    return {
      name,
      data: { name },
    };
  }

  return null;
};

export const initialState: ActiveUser | null = typeof window !== "undefined" ? load() : null;

export default (state: ActiveUser | null = initialState, action: Actions): ActiveUser | null => {
  switch (action.type) {
    case ActionTypes.RELOAD: {
      return load();
    }
    case ActionTypes.UPDATE: {
      const { data } = action;
      return Object.assign({}, state, { data });
    }
    default:
      return state;
  }
};

/* Actions */
export const setActiveUser = (name: string) => async (dispatch: Dispatch) => {
  ls.set("active_user", name);
  dispatch(reloadAct());
};

export const resetActiveUser = () => async (dispatch: Dispatch) => {
  ls.remove("active_user");
  dispatch(reloadAct());
};

export const updateActiveUser = (data: Account) => async (dispatch: Dispatch) => {
  dispatch(updateAct(data));
};

/* Action Creators */
export const reloadAct = (): ReloadAction => {
  return {
    type: ActionTypes.RELOAD,
  };
};

export const updateAct = (data: Account): UpdateAction => {
  return {
    type: ActionTypes.UPDATE,
    data,
  };
};
