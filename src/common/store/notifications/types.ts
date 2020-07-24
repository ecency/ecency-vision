interface BaseNotification {
    event: "notify";
    source: string;
    target: string;
    timestamp: string;
}

export interface VoteNotification extends BaseNotification {
    type: "vote",
    extra: {
        permlink: string;
        weight: number;
        title: string | null;
        img_url: string | null;
    }
}

export interface MentionNotification extends BaseNotification {
    type: "mention",
    extra: {
        permlink: string;
        is_post: 0 | 1;
        title: string | null;
        img_url: string | null;
    }
}

export interface FollowNotification extends BaseNotification {
    type: "follow",
    extra: {
        what: string[]
    }
}

export interface ReplyNotification extends BaseNotification {
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

export interface ReblogNotification extends BaseNotification {
    type: "reblog";
    extra: {
        permlink: string;
        title: string | null;
        img_url: string | null;
    }

}

export interface TransferNotification extends BaseNotification {
    type: "transfer";
    extra: {
        amount: string;
        memo: string;
    }
}

export type Notification = VoteNotification | MentionNotification | FollowNotification | ReplyNotification | ReblogNotification | TransferNotification;

export type NotificationFilter = 'vote' | 'mention' | 'follow' | 'reply' | 'reblog' | 'transfer';

export interface Notifications {
    filter: NotificationFilter | null;
    unread: number;
    list: Notification[];
    loading: boolean,
    error: boolean
}

export enum ActionTypes {
    FETCH = "@notifications/FETCH",
    FETCHED = "@notifications/FETCHED",
    FETCH_ERROR = "@notifications/FETCH_ERROR",
    RESET = "@notifications/RESET",
    SET_FILTER = "@notifications/SET_FILTER",
    SET_UNREAD_COUNT = "@notifications/SET_UNREAD_COUNT",
}

export interface FetchAction {
    type: ActionTypes.FETCH;
}

export interface FetchedAction {
    type: ActionTypes.FETCHED;
    list: Notification[];
}

export interface FetchErrorAction {
    type: ActionTypes.FETCH_ERROR;
}

export interface ResetAction {
    type: ActionTypes.RESET;
}

export interface SetFilterAction {
    type: ActionTypes.SET_FILTER;
    filter: NotificationFilter | null;
}

export interface SetUnreadCountAction {
    type: ActionTypes.SET_UNREAD_COUNT;
    count: number
}


export type Actions = FetchAction | FetchedAction | FetchErrorAction | ResetAction | SetFilterAction | SetUnreadCountAction;
