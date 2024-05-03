import { SMTAsset } from "@hiveio/dhive";

interface BaseTransaction {
  num: number;
  type: string;
  timestamp: string;
  trx_id: string;
}

export interface CurationReward extends BaseTransaction {
  type: "curation_reward";
  comment_author?: string;
  comment_permlink?: string;
  author?: string;
  permlink?: string;
  curator: string;
  reward: string;
}

export interface AuthorReward extends BaseTransaction {
  type: "author_reward";
  author: string;
  permlink: string;
  hbd_payout: string;
  hive_payout: string;
  vesting_payout: string;
}

export interface CommentBenefactor extends BaseTransaction {
  type: "comment_benefactor_reward";
  benefactor: string;
  author: string;
  permlink: string;
  hbd_payout: string;
  hive_payout: string;
  vesting_payout: string;
}

export interface ClaimRewardBalance extends BaseTransaction {
  type: "claim_reward_balance";
  account: string;
  reward_hbd: string;
  reward_hive: string;
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

export interface SetWithdrawRoute extends BaseTransaction {
  type: "set_withdraw_vesting_route";
  from_account: string;
  to_account: string;
  percent: number;
  auto_vest: boolean;
}

export interface TransferToSavings extends BaseTransaction {
  type: "transfer_to_savings";
  amount: string;
  memo?: string;
  from: string;
  to: string;
}

export interface CancelTransferFromSavings extends BaseTransaction {
  from: string;
  request_id: number;
  type: "cancel_transfer_from_savings";
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

export interface LimitOrderCancel extends BaseTransaction {
  type: "limit_order_cancel";
  owner: string;
  orderid: number;
  num: number;
}

export interface ProducerReward extends BaseTransaction {
  type: "producer_reward";
  vesting_shares: string;
  producer: string;
}

export interface Interest extends BaseTransaction {
  type: "interest";
  owner: string;
  interest: string;
}

export interface FillConvertRequest extends BaseTransaction {
  type: "fill_convert_request";
  amount_in: string;
  amount_out: string;
}

export interface FillCollateralizedConvertRequest extends BaseTransaction {
  type: "fill_collateralized_convert_request";
  owner: string;
  requestid: number;
  amount_in: string;
  amount_out: string;
  excess_collateral: string;
}

export interface ReturnVestingDelegation extends BaseTransaction {
  type: "return_vesting_delegation";
  vesting_shares: string;
}

export interface ProposalPay extends BaseTransaction {
  type: "proposal_pay";
  payment: string;
}

export interface UpdateProposalVotes extends BaseTransaction {
  type: "update_proposal_votes";
  voter: string;
  proposal_ids: [number];
  approve: boolean;
}

export interface CommentPayoutUpdate extends BaseTransaction {
  type: "comment_payout_update";
  author: string;
  permlink: string;
}

export interface CommentReward extends BaseTransaction {
  type: "comment_reward";
  author: string;
  permlink: string;
  payout: string;
}

export interface CollateralizedConvert extends BaseTransaction {
  type: "collateralized_convert";
  owner: string;
  requestid: number;
  amount: string;
}

export interface RecurrentTransfers extends BaseTransaction {
  type: "recurrent_transfer";
  amount: string;
  memo: string;
  from: string;
  to: string;
  recurrence: number;
  executions: number;
}

export interface FillRecurrentTransfers extends BaseTransaction {
  type: "fill_recurrent_transfer";
  amount: SMTAsset;
  memo: string;
  from: string;
  to: string;
  remaining_executions: number;
}

export interface DelegateVestingShares extends BaseTransaction {
  type: "delegate_vesting_shares";
  delegator: string;
  delegatee: string;
  vesting_shares: string;
}

export interface LimitOrderCreate extends BaseTransaction {
  type: "limit_order_create";
  owner: string;
  orderid: number;
  amount_to_sell: string;
  min_to_receive: string;
  expiration: string;
}

export interface FillVestingWithdraw extends BaseTransaction {
  type: "fill_vesting_withdraw";
  from_account: string;
  to_account: string;
  withdrawn: string;
  deposited: string;
}

export interface EffectiveCommentVote extends BaseTransaction {
  type: "effective_comment_vote";
  voter: string;
  author: string;
  permlink: string;
  pending_payout: string;
  total_vote_weight: number;
  rshares: number;
  weight: number;
}

export interface VoteProxy extends BaseTransaction {
  type: "account_witness_proxy";
  account: string;
  proxy: string;
}

export type Transaction =
  | CurationReward
  | AuthorReward
  | CommentBenefactor
  | ClaimRewardBalance
  | Transfer
  | TransferToVesting
  | TransferToSavings
  | CancelTransferFromSavings
  | WithdrawVesting
  | SetWithdrawRoute
  | FillOrder
  | ProducerReward
  | Interest
  | FillConvertRequest
  | FillCollateralizedConvertRequest
  | ReturnVestingDelegation
  | ProposalPay
  | UpdateProposalVotes
  | CommentPayoutUpdate
  | CommentReward
  | CollateralizedConvert
  | RecurrentTransfers
  | FillRecurrentTransfers
  | LimitOrderCreate
  | LimitOrderCancel
  | FillVestingWithdraw
  | EffectiveCommentVote
  | VoteProxy
  | DelegateVestingShares;

export type OperationGroup =
  | "transfers"
  | "market-orders"
  | "interests"
  | "stake-operations"
  | "rewards";

export interface Transactions {
  list: Transaction[];
  loading: boolean;
  group: OperationGroup | "";
}

export enum ActionTypes {
  FETCH = "@transactions/FETCH",
  FETCHED = "@transactions/FETCHED",
  FETCH_ERROR = "@transactions/FETCH_ERROR",
  RESET = "@transactions/RESET"
}

export interface FetchAction {
  type: ActionTypes.FETCH;
  group: OperationGroup | "";
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
