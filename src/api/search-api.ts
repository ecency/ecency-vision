import axios from "axios";
import { dataLimit } from "./bridge";
import { apiBase } from "./helper";
import {
  AccountSearchResult,
  FriendSearchResult,
  SearchResponse,
  TagSearchResult
} from "@/entities";

export const search = (
  q: string,
  sort: string,
  hideLow: string,
  since?: string,
  scroll_id?: string,
  votes?: number
): Promise<SearchResponse> => {
  const data: {
    q: string;
    sort: string;
    hide_low: string;
    since?: string;
    scroll_id?: string;
    votes?: number;
  } = { q, sort, hide_low: hideLow };

  if (since) data.since = since;
  if (scroll_id) data.scroll_id = scroll_id;
  if (votes) data.votes = votes;

  return axios.post(apiBase(`/search-api/search`), data).then((resp) => resp.data);
};

export const searchFollower = (following: string, q: string): Promise<FriendSearchResult[]> => {
  const data = { following, q };

  return axios.post(apiBase(`/search-api/search-follower`), data).then((resp) => resp.data);
};

export const searchFollowing = (follower: string, q: string): Promise<FriendSearchResult[]> => {
  const data = { follower, q };

  return axios.post(apiBase(`/search-api/search-following`), data).then((resp) => resp.data);
};

export const searchAccount = (
  q: string = "",
  limit: number = dataLimit,
  random: number = 1
): Promise<AccountSearchResult[]> => {
  const data = { q, limit, random };

  return axios.post(apiBase(`/search-api/search-account`), data).then((resp) => resp.data);
};
export const searchTag = (
  q: string = "",
  limit: number = dataLimit,
  random: number = 0
): Promise<TagSearchResult[]> => {
  const data = { q, limit, random };

  return axios.post(apiBase(`/search-api/search-tag`), data).then((resp) => resp.data);
};

export const searchPath = (username: string, q: string): Promise<string[]> => {
  const data = { q };
  return axios.post(apiBase(`/search-api/search-path`), data).then((resp) => resp.data);
};
