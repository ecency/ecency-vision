import {LoginAction, LogoutAction} from "../active-user/types";

// Web socket notification types

interface BaseWsNotification {
    source: string;
    target: string;
    timestamp: string;
}

export interface WsVoteNotification extends BaseWsNotification {
    type: "vote",
    extra: {
        permlink: string;
        weight: number;
        title: string | null;
        img_url: string | null;
    }
}

export interface WsMentionNotification extends BaseWsNotification {
    type: "mention",
    extra: {
        permlink: string;
        is_post: 0 | 1;
        title: string | null;
        img_url: string | null;
    }
}

export interface WsFollowNotification extends BaseWsNotification {
    type: "follow",
    extra: {
        what: string[]
    }
}

export interface WsReplyNotification extends BaseWsNotification {
    type: "reply",
    extra: {
        title: string;
        body: string;
        json_metadata: string;
        permlink: string;
        parent_author: string;
        parent_permlink: string;
        parent_title: string | null;
        parent_img_url: string | null;
    }
}

export interface WsReblogNotification extends BaseWsNotification {
    type: "reblog";
    extra: {
        permlink: string;
        title: string | null;
        img_url: string | null;
    }

}

export interface WsTransferNotification extends BaseWsNotification {
    type: "transfer";
    extra: {
        amount: string;
        memo: string;
    }
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
    WsVoteNotification
    | WsMentionNotification
    | WsFollowNotification
    | WsReplyNotification
    | WsReblogNotification
    | WsTransferNotification
    | WsSpinNotification
    | WsInactiveNotification
    | WsReferralNotification;

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
    type: "vote" | "unvote",
    voter: string;
    weight: number;
    author: string;
    permlink: string;
    title: string | null;
    img_url: string | null;
}

export interface ApiMentionNotification extends BaseAPiNotification {
    type: "mention",
    author: string;
    account: string;
    permlink: string;
    post: boolean;
    title: string | null;
    img_url: string | null;
}

export interface ApiFollowNotification extends BaseAPiNotification {
    type: "follow" | "unfollow" | "ignore",
    follower: string;
    following: string;
    blog: boolean;
}

export interface ApiReblogNotification extends BaseAPiNotification {
    type: "reblog",
    account: string;
    author: string;
    permlink: string;
    title: string | null;
    img_url: string | null;
}

export interface ApiReplyNotification extends BaseAPiNotification {
    type: "reply",
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

export interface ApiSpinNotification extends BaseAPiNotification {
    type: "spin";
}

export interface ApiInactiveNotification extends BaseAPiNotification {
    type: "inactive";
}

export interface ApiReferralNotification extends BaseAPiNotification {
    type: "referral";
}


export type ApiNotification =
    ApiVoteNotification
    | ApiMentionNotification
    | ApiFollowNotification
    | ApiReblogNotification
    | ApiReplyNotification
    | ApiTransferNotification
    | ApiSpinNotification
    | ApiInactiveNotification
    | ApiReferralNotification;

export enum NotificationFilter {
    VOTES = "rvotes",
    MENTIONS = "mentions",
    FOLLOWS = "follows",
    REPLIES = "replies",
    REBLOGS = "reblogs",
    TRANSFERS = "transfers"
}

export enum NFetchMode {
    REPLACE = "REPLACE",
    APPEND = "APPEND"
}

export interface Notifications {
    filter: NotificationFilter | null;
    unread: number;
    list: ApiNotification[];
    loading: boolean,
    hasMore: boolean,
    unreadFetchFlag: boolean,
}

export enum ActionTypes {
    FETCH = "@notifications/FETCH",
    FETCHED = "@notifications/FETCHED",
    SET_FILTER = "@notifications/SET_FILTER",
    SET_UNREAD_COUNT = "@notifications/SET_UNREAD_COUNT",
    MARK = "@notifications/MARK"
}

export interface FetchAction {
    type: ActionTypes.FETCH;
    mode: NFetchMode
}

export interface FetchedAction {
    type: ActionTypes.FETCHED;
    list: ApiNotification[];
    mode: NFetchMode
}

export interface SetFilterAction {
    type: ActionTypes.SET_FILTER;
    filter: NotificationFilter | null;
}

export interface SetUnreadCountAction {
    type: ActionTypes.SET_UNREAD_COUNT;
    count: number
}

export interface MarkAction {
    type: ActionTypes.MARK;
    id: string | null;
}

export type Actions = FetchAction
    | FetchedAction
    | SetFilterAction
    | SetUnreadCountAction
    | LoginAction
    | LogoutAction
    | MarkAction;
