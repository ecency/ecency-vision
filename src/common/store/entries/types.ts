import { LocationChangeAction } from '../common';

export interface EntryBeneficiaryRoute {
  account: string;
  weight: number;
}

export interface EntryVote {
  voter: string;
  rshares: number;
}

export interface EntryStat {
  flag_weight: number;
  gray: boolean;
  hide: boolean;
  total_votes: number;
  is_pinned?: boolean;
}

export interface JsonMetadata {
  tags?: string[];
  app?: any;
  canonical_url?: string;
  format?: string;
  original_author?: string;
  original_permlink?: string;
}

export interface Entry {
  active_votes: EntryVote[];
  author: string;
  author_payout_value: string;
  author_reputation: number;
  author_role?: string;
  author_title?: string;
  beneficiaries: EntryBeneficiaryRoute[];
  blacklists: string[];
  body: string;
  category: string;
  children: number;
  community?: string;
  community_title?: string;
  created: string;
  curator_payout_value: string;
  depth: number;
  is_paidout: boolean;
  json_metadata: JsonMetadata;
  max_accepted_payout: string;
  net_rshares: number;
  parent_author?: string;
  parent_permlink?: string;
  payout: number;
  payout_at: string;
  pending_payout_value: string;
  percent_hbd: number;
  permlink: string;
  post_id: number;
  promoted: string;
  reblogged_by?: string[];
  replies: any[];
  stats?: EntryStat;
  title: string;
  updated: string;
  url: string;
  original_entry?: Entry;
}

export interface EntryGroup {
  entries: Entry[];
  error: string | null;
  loading: boolean;
  hasMore: boolean;
}

export interface Entries extends Record<string, EntryGroup> {}

export enum ActionTypes {
  FETCH = '@entries/FETCH',
  FETCHED = '@entries/FETCHED',
  FETCH_ERROR = '@entries/FETCH_ERROR',
  INVALIDATE = '@entries/INVALIDATE',
  UPDATE = '@entries/UPDATE'
}

export interface FetchAction {
  type: ActionTypes.FETCH;
  groupKey: string;
}

export interface FetchErrorAction {
  type: ActionTypes.FETCH_ERROR;
  groupKey: string;
  error: string;
}

export interface FetchedAction {
  type: ActionTypes.FETCHED;
  groupKey: string;
  entries: Entry[];
  hasMore: boolean;
}

export interface InvalidateAction {
  type: ActionTypes.INVALIDATE;
  groupKey: string;
}

export interface UpdateAction {
  type: ActionTypes.UPDATE;
  entry: Entry;
}

export type Actions =
  | LocationChangeAction
  | FetchAction
  | FetchedAction
  | FetchErrorAction
  | InvalidateAction
  | UpdateAction;
