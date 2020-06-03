export interface Community {
  about: string;
  avatar_url: string;
  created_at: string;
  description: string;
  flag_text: string;
  id: number;
  is_nsfw: boolean;
  lang: string;
  name: string;
  num_authors: number;
  num_pending: number;
  subscribers: number;
  sum_pending: number;
  settings?: any;
  team: Array<Array<string>>;
  title: string;
  type_id: number;
}

export interface State extends Community {}

export enum ActionTypes {
  FETCHED = "@communities/FETCHED",
  RESET = "@communities/RESET",
}

export interface FetchedAction {
  type: ActionTypes.FETCHED;
  data: Community;
}

export interface ResetAction {
  type: ActionTypes.RESET;
}

export type Actions = FetchedAction | ResetAction;
