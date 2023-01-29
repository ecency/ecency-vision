import { Entry } from "../store/entries/types";
import { Community } from "../store/communities/types";
import { Subscription } from "../store/subscriptions/types";

import { Client } from "@hiveio/dhive";
import SERVERS from "../constants/servers.json";
import { client } from "./hive";

export const bridgeServer = new Client(SERVERS, {
  timeout: 3000,
  failoverThreshold: 3,
  consoleOnFailover: true
});
export const dataLimit = typeof window !== "undefined" && window.screen.width < 540 ? 5 : 20 || 20;

const bridgeApiCall = <T>(endpoint: string, params: {}): Promise<T> =>
  bridgeServer.call("bridge", endpoint, params);

const resolvePost = (post: Entry, observer: string): Promise<Entry> => {
  const { json_metadata: json } = post;

  if (
    json.original_author &&
    json.original_permlink &&
    json.tags &&
    json.tags[0] === "cross-post"
  ) {
    return getPost(json.original_author, json.original_permlink, observer)
      .then((resp) => {
        if (resp) {
          return {
            ...post,
            original_entry: resp
          };
        }

        return post;
      })
      .catch(() => {
        return post;
      });
  }

  return new Promise((resolve) => {
    resolve(post);
  });
};

const resolvePosts = (posts: Entry[], observer: string): Promise<Entry[]> => {
  const promises = posts.map((p) => resolvePost(p, observer));

  return Promise.all(promises);
};

export const getPostsRanked = (
  sort: string,
  start_author: string = "",
  start_permlink: string = "",
  limit: number = dataLimit,
  tag: string = "",
  observer: string = ""
): Promise<Entry[] | null> => {
  return bridgeApiCall<Entry[] | null>("get_ranked_posts", {
    sort,
    start_author,
    start_permlink,
    limit,
    tag,
    observer
  }).then((resp) => {
    if (resp) {
      return resolvePosts(resp, observer);
    }

    return resp;
  });
};

export const getAccountPosts = (
  sort: string,
  account: string,
  start_author: string = "",
  start_permlink: string = "",
  limit: number = dataLimit,
  observer: string = ""
): Promise<Entry[] | null> => {
  return bridgeApiCall<Entry[] | null>("get_account_posts", {
    sort,
    account,
    start_author,
    start_permlink,
    limit,
    observer
  }).then((resp) => {
    if (resp) {
      return resolvePosts(resp, observer);
    }

    return resp;
  });
};

export const getPost = (
  author: string = "",
  permlink: string = "",
  observer: string = ""
): Promise<Entry | null> => {
  return bridgeApiCall<Entry | null>("get_post", {
    author,
    permlink,
    observer
  }).then((resp) => {
    if (resp) {
      return resolvePost(resp, observer);
    }

    return resp;
  });
};

export interface AccountNotification {
  date: string;
  id: number;
  msg: string;
  score: number;
  type: string;
  url: string;
}

export const getAccountNotifications = (
  account: string,
  lastId: number | null = null,
  limit = 50
): Promise<AccountNotification[] | null> => {
  const params: { account: string; last_id?: number; limit: number } = {
    account,
    limit
  };

  if (lastId) {
    params.last_id = lastId;
  }

  return bridgeApiCall<AccountNotification[] | null>("account_notifications", params);
};

export const getDiscussion = (
  author: string,
  permlink: string
): Promise<Record<string, Entry> | null> =>
  bridgeApiCall<Record<string, Entry> | null>("get_discussion", {
    author,
    permlink
  });

export const getCommunity = (
  name: string,
  observer: string | undefined = ""
): Promise<Community | null> =>
  bridgeApiCall<Community | null>("get_community", { name, observer });

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
    observer
  });

export const normalizePost = (post: any): Promise<Entry | null> =>
  bridgeApiCall<Entry | null>("normalize_post", {
    post
  });

export const getSubscriptions = (account: string): Promise<Subscription[] | null> =>
  bridgeApiCall<Subscription[] | null>("list_all_subscriptions", {
    account
  });

export const getSubscribers = (community: string): Promise<Subscription[] | null> =>
  bridgeApiCall<Subscription[] | null>("list_subscribers", {
    community
  });

export interface AccountRelationship {
  follows: boolean;
  ignores: boolean;
  is_blacklisted: boolean;
  follows_blacklists: boolean;
}

export const getRelationshipBetweenAccounts = (
  follower: string,
  following: string
): Promise<AccountRelationship | null> =>
  bridgeApiCall<AccountRelationship | null>("get_relationship_between_accounts", [
    follower,
    following
  ]);

// @source https://ecency.com/hive-139531/@andablackwidow/rc-stats-in-1-27
export type RcOperation =
  | "comment_operation"
  | "vote_operation"
  | "transfer_operation"
  | "custom_json_operation";

export interface RcOperationStats {
  count: number; // number of such operations executed during last day
  avg_cost_rc: number; // average RC cost of single operation
  resource_cost: {
    // average RC cost split between various resources
    history_rc: number;
    tokens_rc: number;
    market_rc: number;
    state_rc: number;
    exec_rc: number;
  };
  resource_cost_share: {
    // share of resource cost in average final cost (expressed in basis points)
    history_bp: number;
    tokens_bp: number;
    market_bp: number;
    state_bp: number;
    exec_bp: number;
  };
  resource_usage: {
    // average consumption of resources per operation
    history_bytes: number; // - size of transaction in bytes
    tokens: string; // - number of tokens (always 0 or 1 (with exception of multiop) - tokens are internally expressed with 4 digit precision
    market_bytes: number; // - size of transaction in bytes when it belongs to market category or 0 otherwise
    state_hbytes: number; // - hour-bytes of state
    exec_ns: number; // - nanoseconds of execution time
  };
}

export const getRcOperationStats = (): Promise<any> =>
  bridgeServer.call("rc_api", "get_rc_stats", {});
