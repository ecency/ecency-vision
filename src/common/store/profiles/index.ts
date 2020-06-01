import { Dispatch } from "redux";

import { Profile, State, Actions, ActionTypes, AddAction } from "./types";

export const initialState: State = [];

export default (state: State = initialState, action: Actions): State => {
  switch (action.type) {
    case ActionTypes.ADD: {
      const { data } = action;
      
      if (state.find((x) => x.name === data.name) !== undefined) {
        return state;
      }

      return [...state, data];
    }
    default:
      return state;
  }
};

/* Actions */
export const addProfile = (data: Profile) => (dispatch: Dispatch) => {
  dispatch(addAct(data));
};

/* Action Creators */
export const addAct = (data: Profile): AddAction => {
  return {
    type: ActionTypes.ADD,
    data,
  };
};
