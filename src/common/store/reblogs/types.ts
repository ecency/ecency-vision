export interface Reblog {
  account: string;
  author: string;
  permlink: string;
}

export enum ActionTypes {
  RELOAD = "@reblogs/RELOAD",
}

export interface ReloadAction {
  type: ActionTypes.RELOAD;
}

export type Actions = ReloadAction;
