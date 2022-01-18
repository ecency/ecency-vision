import { LoginAction, LogoutAction } from "../active-user/types";

export type Subscription = Array<string>;

export enum ActionTypes {
  UPDATE = "@subscriptions/UPDATE"
}

export interface UpdateAction {
  type: ActionTypes.UPDATE;
  list: Subscription[];
}

export type Actions = UpdateAction | LoginAction | LogoutAction;
