interface BaseTransaction {
  num: number;
  type: string;
  timestamp: string;
}

export interface CurationReward extends BaseTransaction {
  type: "curation_reward";
  comment_author: string;
  comment_permlink: string;
  curator: string;
  reward: string;
}

export interface AuthorReward extends BaseTransaction {
  type: "author_reward";
  author: string;
  permlink: string;
  sbd_payout: string;
  steem_payout: string;
  vesting_payout: string;
}

export interface CommentBenefactor extends BaseTransaction {
  type: "comment_benefactor_reward";
  benefactor: string;
  author: string;
  permlink: string;
  sbd_payout: string;
  steem_payout: string;
  vesting_payout: string;
}

export interface ClaimRewardBalance extends BaseTransaction {
  type: "claim_reward_balance";
  account: string;
  reward_sbd: string;
  reward_steem: string;
  reward_vests: string;
}

export interface Transfer extends BaseTransaction {
  type: "transfer";
  amount: string;
  memo: string;
  from: string;
  to: string;
}

export interface TransferToVesting extends BaseTransaction {
  type: "transfer_to_vesting";
  amount: string;
  memo?: string;
  from: string;
  to: string;
}

export interface WithdrawVesting extends BaseTransaction {
  type: "withdraw_vesting";
  acc: string;
  vesting_shares: string;
}

export interface FillOrder extends BaseTransaction {
  type: "fill_order";
  current_pays: string;
  open_pays: string;
}

export type Transaction =
  | CurationReward
  | AuthorReward
  | CommentBenefactor
  | ClaimRewardBalance
  | Transfer
  | TransferToVesting
  | WithdrawVesting
  | FillOrder;

export interface Transactions {
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
