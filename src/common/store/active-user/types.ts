import { Account } from "../accounts/types";

export interface ActiveUser {
  name: string;
  data: Account;
}

export enum ActionTypes {
  RELOAD = "@active-user/RELOAD",
  UPDATE = "@active-user/UPDATE",
}

export interface ReloadAction {
  type: ActionTypes.RELOAD;
}

export interface UpdateAction {
  type: ActionTypes.UPDATE;
  data: Account;
}

export type Actions = ReloadAction | UpdateAction;
