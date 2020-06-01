import axios from "axios";
import { Client } from "@esteemapp/dhive";

import { Entry } from "../store/entries/types";
import { Profile } from "../store/profiles/types";
import { Community } from "../store/community/types";
import { TrendingTag } from "../store/trending-tags/types";

const DEFAULT_SERVERS = [
  "https://anyx.io",
  "https://rpc.esteem.app",
  "https://api.hive.blog",
  "https://api.hivekings.com",
];

let client = new Client(DEFAULT_SERVERS, {
  timeout: 3000,
});

export const getTrendingTags = (
  afterTag: string = "",
  limit: number = 50
): Promise<string[]> =>
  client.database
    .call("get_trending_tags", [afterTag, limit])
    .then((t: TrendingTag[]) =>
      t.filter((x) => x.name !== "").map((x) => x.name)
    );

export const getContent = (
  username: string,
  permlink: string
): Promise<Entry> =>
  client.call("condenser_api", "get_content", [username, permlink]);

const pickAServer = (): string =>
  DEFAULT_SERVERS.sort(() => 0.5 - Math.random())[0];

const bridgeApiCall = <T>(endpoint: string, params: {}): Promise<T> =>
  axios
    .post(pickAServer(), {
      jsonrpc: "2.0",
      method: endpoint,
      params: params,
      id: 1,
    })
    .then((resp) => {
      return resp?.data?.result || null;
    });

export const getProfile = (
  username: string,
  observer: string = ""
): Promise<Profile | null> =>
  bridgeApiCall<Profile | null>("bridge.get_profile", {
    account: username,
    observer,
  });

export const getPostsRanked = (
  sort: string,
  start_author: string = "",
  start_permlink: string = "",
  limit: number = 20,
  tag: string = "",
  observer: string = ""
): Promise<Entry[] | null> =>
  bridgeApiCall<Entry[] | null>("bridge.get_ranked_posts", {
    sort,
    start_author,
    start_permlink,
    limit,
    tag,
    observer,
  });

export const getPost = (
  author: string = "",
  permlink: string = "",
  observer: string = ""
): Promise<Entry | null> =>
  bridgeApiCall<Entry | null>("bridge.get_post", {
    author,
    permlink,
    observer,
  });

export const getCommunity = (
  name: string,
  observer: string = ""
): Promise<Community | null> =>
  bridgeApiCall<Community | null>("bridge.get_community", { name, observer });

export const getCommunities = (
  last: string = "",
  limit: number = 100,
  query: string = "",
  sort: string = "rank",
  observer: string = ""
): Promise<Community[] | null> =>
  bridgeApiCall<Community[] | null>("bridge.list_communities", {
    last,
    limit,
    query,
    sort,
    observer,
  });
