export interface TrendingTag {
  comments: number;
  name: string;
  top_posts: number;
  total_payouts: string;
}

export interface TrendingTags {
  list: string[];
  loading: boolean;
  error: boolean;
}

export enum ActionTypes {
  FETCH = "@trending-tags/FETCH",
  FETCHED = "@trending-tags/FETCHED",
  FETCH_ERROR = "@trending-tags/FETCH_ERROR",
}

export interface FetchAction {
  type: ActionTypes.FETCH;
}

export interface FetchedAction {
  type: ActionTypes.FETCHED;
  tags: string[];
}

export interface FetchErrorAction {
  type: ActionTypes.FETCH_ERROR;
}

export type Actions = FetchAction | FetchedAction | FetchErrorAction;
