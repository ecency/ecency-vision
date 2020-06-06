export interface Transaction {
  0: number;
}

export interface AuthorRewardTransaction extends Transaction {
  1: {
    op: [
      "author_reward",
      {
        author: string;
        permlink: string;
        sbd_payout: string;
        steem_payout: string;
        vesting_payout: string;
      }
    ];
    timestamp: string;
  };
}

export interface State {
  list: Transaction[];
  loading: boolean;
  error: boolean;
}

export enum ActionTypes {
  FETCH = "@transactions/FETCH",
  FETCHED = "@transactions/FETCHED",
  FETCH_ERROR = "@transactions/FETCH_ERROR",
  RESET = "@transactions/RESET",
}

export interface FetchAction {
  type: ActionTypes.FETCH;
}

export interface FetchedAction {
  type: ActionTypes.FETCHED;
  transactions: Transaction[];
}

export interface FetchErrorAction {
  type: ActionTypes.FETCH_ERROR;
}

export interface ResetAction {
  type: ActionTypes.RESET;
}

export type Actions = FetchAction | FetchedAction | FetchErrorAction | ResetAction;
