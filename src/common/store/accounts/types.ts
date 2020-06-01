import { ExtendedAccount } from "@esteemapp/dhive";

export interface Account extends ExtendedAccount {}

export interface State {
  data: Account;
  loading: boolean;
  error: boolean;
}

export enum ActionTypes {
  FETCH = "@account/FETCH",
  FETCHED = "@account/FETCHED",
  FETCH_ERROR = "@account/FETCH_ERROR"
}

export interface FetchAction {
  type: ActionTypes.FETCH;
}

export interface FetchedAction {
  type: ActionTypes.FETCHED;
  data: Account;
}

export interface FetchErrorAction {
  type: ActionTypes.FETCH_ERROR;
}

export type Actions = FetchAction | FetchedAction | FetchErrorAction;