import { Authority } from "@hiveio/dhive";

export interface AccountProfile {
  about?: string;
  cover_image?: string;
  location?: string;
  name?: string;
  profile_image?: string;
  website?: string;
}

export interface AccountFollowStats {
  follower_count: number;
  following_count: number;
  account: string;
}

export interface BaseAccount {
  name: string;
  __loaded?: false;
}

export interface FullAccount {
  name: string;
  owner: Authority;
  active: Authority;
  posting: Authority;
  memo_key: string;
  post_count: number;
  created: string;
  reputation: string | number;
  json_metadata: string;
  posting_json_metadata: string;
  last_vote_time: string;
  last_post: string;
  reward_hbd_balance: string;
  reward_vesting_hive: string;
  reward_hive_balance: string;
  reward_vesting_balance: string;
  balance: string;
  vesting_shares: string;
  hbd_balance: string;
  savings_balance: string;
  savings_hbd_balance: string;
  next_vesting_withdrawal: string;
  delegated_vesting_shares: string;
  received_vesting_shares: string;
  vesting_withdraw_rate: string;
  to_withdraw: string;
  withdrawn: string;
  witness_votes: string[];
  proxy: string;
  proxied_vsf_votes: number[] | string[];
  voting_manabar: {
    current_mana: string | number;
    last_update_time: number;
  };
  voting_power: number;
  downvote_manabar: {
    current_mana: string | number;
    last_update_time: number;
  };
  profile?: AccountProfile;
  follow_stats?: AccountFollowStats;
  __loaded?: true;
}

export type Account = FullAccount | BaseAccount;

export type Accounts = Account[];

export enum ActionTypes {
  ADD = "@accounts/ADD"
}

export interface AddAction {
  type: ActionTypes.ADD;
  data: Account;
}

export type Actions = AddAction; // | .. | ..
