import { Dispatch } from "redux";
import { getCommunity } from "../../api/bridge";

import { AppState } from "../index";

import {
  Community,
  Actions,
  ActionTypes,
  State,
  FetchedAction,
  ResetAction,
} from "./types";

export const initialState: State | null = null;

export default (
  state: State | null = initialState,
  action: Actions
): State | null => {
  switch (action.type) {
    case ActionTypes.FETCHED: {
      const { data } = action;
      return { ...data };
    }
    case ActionTypes.RESET: {
      return null;
    }
    default:
      return state;
  }
};

/* Actions */
export const fetchCommunity = () => (
  dispatch: Dispatch,
  getState: () => AppState
) => {
  const { global } = getState();
  const { tag } = global;

  if (!tag.startsWith("hive-")) {
    dispatch(resetAct());
    return;
  }

  getCommunity(tag).then((r) => {
    if (!r) {
      dispatch(resetAct());
      return;
    }

    dispatch(fetchedAct(r));
  });
};

/* Action Creators */

export const fetchedAct = (data: Community): FetchedAction => {
  return {
    type: ActionTypes.FETCHED,
    data,
  };
};

export const resetAct = (): ResetAction => {
  return {
    type: ActionTypes.RESET,
  };
};
