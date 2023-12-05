// Web socket notification types
interface BaseWsNotification {
  source: string;
  target: string;
  timestamp: string;
}

export interface WsVoteNotification extends BaseWsNotification {
  type: "vote";
  extra: {
    permlink: string;
    weight: number;
    title: string | null;
    img_url: string | null;
  };
}

export interface WsMentionNotification extends BaseWsNotification {
  type: "mention";
  extra: {
    permlink: string;
    is_post: 0 | 1;
    title: string | null;
    img_url: string | null;
  };
}

export interface WsFavoriteNotification extends BaseWsNotification {
  type: "favorites";
  extra: {
    permlink: string;
    is_post: 0 | 1;
    title: string | null;
  };
}

export interface WsBookmarkNotification extends BaseWsNotification {
  type: "bookmarks";
  extra: {
    permlink: string;
    is_post: 0 | 1;
    title: string | null;
  };
}

export interface WsFollowNotification extends BaseWsNotification {
  type: "follow";
  extra: {
    what: string[];
  };
}

export interface WsReplyNotification extends BaseWsNotification {
  type: "reply";
  extra: {
    title: string;
    body: string;
    json_metadata: string;
    permlink: string;
    parent_author: string;
    parent_permlink: string;
    parent_title: string | null;
    parent_img_url: string | null;
  };
}

export interface WsReblogNotification extends BaseWsNotification {
  type: "reblog";
  extra: {
    permlink: string;
    title: string | null;
    img_url: string | null;
  };
}

export interface WsTransferNotification extends BaseWsNotification {
  type: "transfer";
  extra: {
    amount: string;
    memo: string;
  };
}

export interface WsDelegationsNotification extends BaseWsNotification {
  type: "delegations";
  extra: {
    amount: string;
  };
}

export interface WsSpinNotification extends BaseWsNotification {
  type: "spin";
}

export interface WsInactiveNotification extends BaseWsNotification {
  type: "inactive";
}

export interface WsReferralNotification extends BaseWsNotification {
  type: "referral";
}

export type WsNotification =
  | WsVoteNotification
  | WsMentionNotification
  | WsFavoriteNotification
  | WsBookmarkNotification
  | WsFollowNotification
  | WsReplyNotification
  | WsReblogNotification
  | WsTransferNotification
  | WsSpinNotification
  | WsInactiveNotification
  | WsReferralNotification
  | WsDelegationsNotification;

// HTTP api notification types

interface BaseAPiNotification {
  id: string;
  source: string;
  read: 0 | 1;
  timestamp: string; // iso formatted date
  ts: number; // unix timestamp
  gk: string; // group key
  gkf: boolean; // group key flag. true when a new group started
}

export interface ApiVoteNotification extends BaseAPiNotification {
  type: "vote" | "unvote";
  voter: string;
  weight: number;
  author: string;
  permlink: string;
  title: string | null;
  img_url: string | null;
}

export interface ApiMentionNotification extends BaseAPiNotification {
  type: "mention";
  author: string;
  account: string;
  permlink: string;
  post: boolean;
  title: string | null;
  img_url: string | null;
  deck?: boolean;
}

export interface ApiFollowNotification extends BaseAPiNotification {
  type: "follow" | "unfollow" | "ignore";
  follower: string;
  following: string;
  blog: boolean;
}

export interface ApiReblogNotification extends BaseAPiNotification {
  type: "reblog";
  account: string;
  author: string;
  permlink: string;
  title: string | null;
  img_url: string | null;
}

export interface ApiReplyNotification extends BaseAPiNotification {
  type: "reply";
  author: string;
  permlink: string;
  title: string;
  body: string;
  json_metadata: string;
  metadata: any;
  parent_author: string;
  parent_permlink: string;
  parent_title: string | null;
  parent_img_url: string | null;
}

export interface ApiTransferNotification extends BaseAPiNotification {
  type: "transfer";
  to: string;
  amount: string;
  memo: string | null;
}

export interface ApiFavoriteNotification extends BaseAPiNotification {
  type: "favorites";
  author: string;
  account: string;
  permlink: string;
  post: boolean;
  title: string | null;
}

export interface ApiBookmarkNotification extends BaseAPiNotification {
  type: "bookmarks";
  author: string;
  account: string;
  permlink: string;
  post: boolean;
  title: string | null;
}

export interface ApiSpinNotification extends BaseAPiNotification {
  type: "spin";
}

export interface ApiInactiveNotification extends BaseAPiNotification {
  type: "inactive";
}

export interface ApiReferralNotification extends BaseAPiNotification {
  type: "referral";
}

export interface ApiDelegationsNotification extends BaseAPiNotification {
  type: "delegations";
  to: string;
  amount: string;
}

export interface ApiNotificationSetting {
  system: string; //"web" | "desktop"
  allows_notify: number; //0|1
  notify_types: number[]; //vote:1,mention:2,follow:3,reply:4,reblog:5,transfers:6,delegations:10,engine-transfers:12
  status: number; //0|1
}

export type ApiNotification =
  | ApiVoteNotification
  | ApiMentionNotification
  | ApiFavoriteNotification
  | ApiBookmarkNotification
  | ApiFollowNotification
  | ApiReblogNotification
  | ApiReplyNotification
  | ApiTransferNotification
  | ApiSpinNotification
  | ApiInactiveNotification
  | ApiReferralNotification
  | ApiDelegationsNotification;
