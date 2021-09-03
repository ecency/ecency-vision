import axios from "axios";
import { dataLimit } from "./bridge";

import {apiBase} from "./helper";

export interface SearchResult {
    id: number;
    title: string;
    title_marked: string | null;
    category: string;
    author: string;
    permlink: string;
    author_rep: number | string;
    children: number;
    body: string;
    body_marked: string | null;
    img_url: string;
    created_at: string;
    payout: number;
    total_votes: number;
    up_votes: number;
    tags: string[];
    depth: number;
    app: string;
}

export interface SearchResponse {
    hits: number;
    results: SearchResult[];
    scroll_id?: string;
    took: number;
}

export const search = (q: string, sort: string, hideLow: string, since?: string, scroll_id?: string): Promise<SearchResponse> => {
    const data: { q: string, sort: string, hide_low: string, since?: string, scroll_id?: string } = {q, sort, hide_low: hideLow};

    if (since) data.since = since;
    if (scroll_id) data.scroll_id = scroll_id;

    return axios.post(apiBase(`/search-api/search`), data).then(resp => resp.data);
}

export interface FriendSearchResult {
    name: string;
    full_name: string;
    reputation: number
}

export const searchFollower = (following: string, q: string): Promise<FriendSearchResult[]> => {
    const data = {following, q};

    return axios.post(apiBase(`/search-api/search-follower`), data).then(resp => resp.data);
}

export const searchFollowing = (follower: string, q: string): Promise<FriendSearchResult[]> => {
    const data = {follower, q};

    return axios.post(apiBase(`/search-api/search-following`), data).then(resp => resp.data);
}

export interface AccountSearchResult {
    name: string;
    full_name: string;
    about: string;
    reputation: number
}

export const searchAccount = (q: string = "", limit: number = dataLimit, random: number = 1): Promise<AccountSearchResult[]> => {
    const data = {q, limit, random};

    return axios.post(apiBase(`/search-api/search-account`), data).then(resp => resp.data);
}

export interface TagSearchResult {
    tag: string;
    repeat: number;
}

export const searchTag = (q: string = "", limit: number = dataLimit, random: number = 0): Promise<TagSearchResult[]> => {
    const data = {q, limit, random};

    return axios.post(apiBase(`/search-api/search-tag`), data).then(resp => resp.data);
}

export const searchPath = (username: string, q: string): Promise<string[]> => {
    const data = {q};
    return axios.post(apiBase(`/search-api/search-path`), data).then(resp => resp.data);
}
