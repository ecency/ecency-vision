export interface User {
  username: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export enum ActionTypes {
  ADD = "@users/ADD",
  REFRESH = "@users/REFRESH",
}

export interface AddAction {
  type: ActionTypes.ADD;
  user: User;
}

export interface RefreshAction {
  type: ActionTypes.REFRESH;
}

export type Actions = AddAction | RefreshAction;
