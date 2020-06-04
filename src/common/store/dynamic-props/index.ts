import { Dispatch } from "redux";

import { DynamicProps, State, Actions, ActionTypes, FetchedAction } from "./types";

export const initialState: State = {
  hivePerMVests: 1,
  base: 1,
  quote: 1,
  fundRecentClaims: 1,
  fundRewardBalance: 1,
};

export default (state: State = initialState, action: Actions): State => {
  switch (action.type) {
    case ActionTypes.FETCHED: {
      return { ...action.props };
    }
    default:
      return state;
  }
};

/* Actions */
export const fetchDynamicProps = () => (dispatch: Dispatch) => {
  // dispatch(fetchedAct(props));
};

/* Action Creators */
export const fetchedAct = (props: DynamicProps): FetchedAction => {
  return {
    type: ActionTypes.FETCHED,
    props,
  };
};
