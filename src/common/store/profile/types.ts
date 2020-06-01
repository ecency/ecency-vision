export interface Profile {
  id: number;
  name: string;
  created: string;
  active: string;
  post_count: number;
  reputation: number;
  stats: {
    sp: number;
    rank: number;
    following: number;
    followers: number;
  };
  metadata: {
    profile: {
      name?: string;
      about?: string;
      website?: string;
      location?: string;
      cover_image?: string;
      profile_image?: string;
    };
  };
}

export interface State {
  data: Account;
  loading: boolean;
  error: boolean;
}

export enum ActionTypes {
  FETCH = "@account/FETCH",
  FETCHED = "@account/FETCHED",
  FETCH_ERROR = "@account/FETCH_ERROR",
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
