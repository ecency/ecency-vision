import { LocationChangeAction } from "../common";

export enum ListStyle {
  row = "row",
  grid = "grid",
  deck = "deck"
}

export enum Theme {
  system = "system",
  day = "day",
  night = "night"
}

export enum EntryFilter {
  trending = "trending",
  hot = "hot",
  created = "created",
  payout = "payout",
  payout_comments = "payout_comments",
  muted = "muted",
  controversial = "controversial",
  rising = "rising",
  promoted = "promoted"
}

export enum ProfileFilter {
  blog = "blog",
  posts = "posts",
  comments = "comments",
  replies = "replies"
}

// TODO: Find a proper way to merge EntryFilter and ProfileFilter
export enum AllFilter {
  trending = "trending",
  hot = "hot",
  created = "created",
  payout = "payout",
  payout_comments = "payout_comments",
  muted = "muted", // To see muted accounts
  blog = "blog", // This might be deleted
  posts = "posts",
  comments = "comments",
  replies = "replies",
  communities = "communities",
  feed = "feed",
  no_reblog = "no_reblog",
  controversial = "controversial",
  rising = "rising",
  promoted = "promoted"
}

export interface Global {
  filter: EntryFilter | ProfileFilter | AllFilter;
  tag: string;
  theme: Theme;
  listStyle: ListStyle;
  intro: boolean;
  currency: string;
  currencyRate: number;
  currencySymbol: string;
  lang: string;
  searchIndexCount: number;
  canUseWebp: boolean;
  hasKeyChain: boolean;
  isElectron: boolean;
  newVersion: string | null;
  notifications: boolean;
  nsfw: boolean;
  isMobile: boolean;
  usePrivate: boolean;
  hsClientId: string;
  lastIndexPath: string | null;
  showSelfVote: boolean;
  showRewardSplit: boolean;
  lowRewardThreshold: number;
  showFrontEnd: boolean;
  menuOrder: Array<string>;
  footer: undefined | string;
}

export enum ActionTypes {
  THEME_CHANGE = "@global/THEME_CHANGE",
  INTRO_HIDE = "@global/INTRO_HIDE",
  LIST_STYLE_CHANGE = "@global/LIST_STYLE_CHANGE",
  HAS_KEYCHAIN = "@global/HAS_KEYCHAIN",
  NOTIFICATIONS_MUTE = "@global/NOTIFICATIONS_MUTE",
  NOTIFICATIONS_UNMUTE = "@global/NOTIFICATIONS_UNMUTE",
  CURRENCY_SET = "@global/CURRENCY_SET",
  LANG_SET = "@global/LANG_SET",
  NEW_VERSION_CHANGE = "@global/NEW_VERSION_CHANGE",
  NSFW_SET = "@global/NSFW_SET",
  SET_LAST_INDEX_PATH = "@global/SET_LAST_INDEX_PATH",
  SET_SHOW_SELF_VOTE = "@global/SET_SHOW_SELF_VOTE",
  SET_SHOW_REWARD_SPLIT = "@global/SET_SHOW_REWARD_SPLIT",
  SET_LOW_REWARD_THRESHOLD = "@global/SET_LOW_REWARD_THRESHOLD",
  SET_SHOW_FRONT_END = "@global/SET_SHOW_FRONT_END",
  SET_FOOTER = "@global/SET_FOOTER"
}

export interface ThemeChangeAction {
  type: ActionTypes.THEME_CHANGE;
  theme: Theme;
}

export interface IntroHideAction {
  type: ActionTypes.INTRO_HIDE;
}

export interface ListStyleChangeAction {
  type: ActionTypes.LIST_STYLE_CHANGE;
  listStyle: ListStyle;
}

export interface NewVersionChangeAction {
  type: ActionTypes.NEW_VERSION_CHANGE;
  version: string | null;
}

export interface NotificationsMuteAction {
  type: ActionTypes.NOTIFICATIONS_MUTE;
}

export interface NotificationsUnMuteAction {
  type: ActionTypes.NOTIFICATIONS_UNMUTE;
}

export interface CurrencySetAction {
  type: ActionTypes.CURRENCY_SET;
  currency: string;
  currencyRate: number;
  currencySymbol: string;
}

export interface LangSetAction {
  type: ActionTypes.LANG_SET;
  lang: string;
}

export interface NsfwSetAction {
  type: ActionTypes.NSFW_SET;
  value: boolean;
}

export interface HasKeyChainAction {
  type: ActionTypes.HAS_KEYCHAIN;
}

export interface SetLastIndexPathAction {
  type: ActionTypes.SET_LAST_INDEX_PATH;
  path: string | null;
}

export interface SetShowSelfVoteAction {
  type: ActionTypes.SET_SHOW_SELF_VOTE;
  showSelfVote: boolean;
}

export interface SetShowRewardSplitAction {
  type: ActionTypes.SET_SHOW_REWARD_SPLIT;
  showRewardSplit: boolean;
}

export interface SetLowRewardThresholdAction {
  type: ActionTypes.SET_LOW_REWARD_THRESHOLD;
  lowRewardThreshold: number;
}

export interface SetShowFrontEndAction {
  type: ActionTypes.SET_SHOW_FRONT_END;
  showFrontEnd: boolean;
}

export interface SetFooterAction {
  type: ActionTypes.SET_FOOTER;
  footer: string;
}

export type Actions =
  | LocationChangeAction
  | ThemeChangeAction
  | IntroHideAction
  | ListStyleChangeAction
  | NewVersionChangeAction
  | NotificationsMuteAction
  | NotificationsUnMuteAction
  | CurrencySetAction
  | LangSetAction
  | NsfwSetAction
  | HasKeyChainAction
  | SetLastIndexPathAction
  | SetShowSelfVoteAction
  | SetShowRewardSplitAction
  | SetLowRewardThresholdAction
  | SetShowFrontEndAction
  | SetFooterAction;
