export interface User {
  username: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export enum ActionTypes {
  ADD = "@users/ADD",
  RELOAD = "@users/RELOAD",
}

export interface AddAction {
  type: ActionTypes.ADD;
  user: User;
}

export interface ReloadAction {
  type: ActionTypes.RELOAD;
}

export type Actions = AddAction | ReloadAction;
