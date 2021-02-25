import {Entry} from "../store/entries/types";
import {Community} from "../store/communities/types";
import {Subscription} from "../store/subscriptions/types";

import {client as hiveClient} from "./hive";

const bridgeApiCall = <T>(endpoint: string, params: {}): Promise<T> => hiveClient.call("bridge", endpoint, params);

export const getPostsRanked = (
    sort: string,
    start_author: string = "",
    start_permlink: string = "",
    limit: number = 20,
    tag: string = "",
    observer: string = ""
): Promise<Entry[] | null> =>
    bridgeApiCall<Entry[] | null>("get_ranked_posts", {
        sort,
        start_author,
        start_permlink,
        limit,
        tag,
        observer,
    });

export const getAccountPosts = (
    sort: string,
    account: string,
    start_author: string = "",
    start_permlink: string = "",
    limit: number = 20,
    observer: string = ""
): Promise<Entry[] | null> =>
    bridgeApiCall<Entry[] | null>("get_account_posts", {
        sort,
        account,
        start_author,
        start_permlink,
        limit,
        observer,
    });


export interface AccountNotification {
    date: string;
    id: number;
    msg: string;
    score: number;
    type: string;
    url: string;
}

export const getAccountNotifications = (account: string, lastId: number | null = null, limit = 50): Promise<AccountNotification[] | null> => {
    const params: { account: string, last_id?: number, limit: number } = {
        account, limit
    }

    if (lastId) {
        params.last_id = lastId;
    }

    return bridgeApiCall<AccountNotification[] | null>("account_notifications", params);
}

export const getPost = (author: string = "", permlink: string = "", observer: string = ""): Promise<Entry | null> =>
    bridgeApiCall<Entry | null>("get_post", {
        author,
        permlink,
        observer,
    });

export const getDiscussion = (author: string, permlink: string): Promise<Record<string, Entry> | null> =>
    bridgeApiCall<Record<string, Entry> | null>("get_discussion", {
        author,
        permlink,
    });

export const getCommunity = (name: string, observer: string | undefined = ""): Promise<Community | null> =>
    bridgeApiCall<Community | null>("get_community", {name, observer});

export const getCommunities = (
    last: string = "",
    limit: number = 100,
    query?: string | null,
    sort: string = "rank",
    observer: string = ""
): Promise<Community[] | null> =>
    bridgeApiCall<Community[] | null>("list_communities", {
        last,
        limit,
        query,
        sort,
        observer,
    });

export const normalizePost = (post: any): Promise<Entry | null> =>
    bridgeApiCall<Entry | null>("normalize_post", {
        post,
    });

export const getSubscriptions = (
    account: string
): Promise<Subscription[] | null> =>
    bridgeApiCall<Subscription[] | null>("list_all_subscriptions", {
        account
    });


export const getSubscribers = (
    community: string
): Promise<Subscription[] | null> =>
    bridgeApiCall<Subscription[] | null>("list_subscribers", {
        community
    });

export interface AccountRelationship {
    follows: boolean,
    ignores: boolean,
    is_blacklisted: boolean,
    follows_blacklists: boolean
}

export const getRelationshipBetweenAccounts = (follower: string, following: string): Promise<AccountRelationship | null> =>
    bridgeApiCall<AccountRelationship | null>("get_relationship_between_accounts", [follower, following]);



