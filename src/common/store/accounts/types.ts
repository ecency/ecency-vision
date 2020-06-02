import { ExtendedAccount } from "@esteemapp/dhive";

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
}

export interface Account extends ExtendedAccount {
  profile?: AccountProfile;
  follow_stats?: AccountFollowStats;
}

export type State = Account[];

export enum ActionTypes {
  ADD = "@accounts/ADD",
}

export interface AddAction {
  type: ActionTypes.ADD;
  data: Account;
}

export type Actions = AddAction; // | .. | ..
