import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { AppState } from "../store";

import { History, Location } from "history";
import { ACTIONS, getActions } from "../store/actions";

export type PageProps = AppState &
  typeof ACTIONS & {
    location: Location;
    history: History;
  };

export const pageMapStateToProps = (state: AppState) => ({
  ...state
});

export const pageMapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(getActions(), dispatch);
