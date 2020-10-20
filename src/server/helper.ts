import express from "express";
import axios, {AxiosRequestConfig, AxiosResponse, Method} from "axios";

import {ListStyle, Theme} from "../common/store/global/types";
import {Entry} from "../common/store/entries/types";

import defaults from "../common/constants/defaults.json";

import {getPost} from "../common/api/bridge";

import {cache} from "./cache";

import config from "../config";

export interface GlobalCookies {
    theme: Theme;
    listStyle: ListStyle;
    intro: boolean;
}

export const readGlobalCookies = (req: express.Request): GlobalCookies => {
    const _c = (k: string): any => req.cookies[k];

    const theme = _c("theme") && Object.values(Theme).includes(_c("theme")) ? _c("theme") : defaults.theme;
    const intro = !_c("hide-intro");
    const listStyle = _c("list-style") && Object.values(ListStyle).includes(_c("list-style")) ? _c("list-style") : defaults.listStyle;

    return {theme: Theme[theme], listStyle: ListStyle[listStyle], intro};
};

export const getActiveUser = (req: express.Request): string | null => {
    return req.cookies["active_user"] || null;
};

export const optimizeEntries = (entries: Entry[]): Entry[] => {
    return entries;
    /* Optimization disabled for now
    return entries.map((x) => {
        return {
            ...x,
            ...{active_votes: []}, // remove active votes
        };
    }); */
};

export const baseApiRequest = (url: string, method: Method, headers: any = {}, payload: any = {}): Promise<AxiosResponse> => {
    const requestConf: AxiosRequestConfig = {
        url,
        method,
        validateStatus: () => true,
        responseType: "json",
        headers: {...headers},
        data: {...payload}
    }

    return axios(requestConf)
}

export const apiRequest = (endpoint: string, method: Method, extraHeaders: any = {}, payload: any = {}): Promise<AxiosResponse> => {
    const url = `${config.privateApiAddr}/${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        ...config.privateApiAuth,
        ...extraHeaders
    }

    return baseApiRequest(url, method, headers, payload)
}

export const fetchPromotedEntries = async (): Promise<Entry[]> => {
    // fetch list from api
    const list: { author: string, permlink: string }[] = (await apiRequest('promoted-posts?limit=200', 'GET')).data;

    // random sort & random pick 18 (6*3)
    const promoted = list.sort(() => Math.random() - 0.5).filter((x, i) => i < 18);

    // get post data
    const promises = promoted.map(x => getPost(x.author, x.permlink));

    return await Promise.all(promises) as Entry[];
}

export const getPromotedEntries = async (): Promise<Entry[]> => {
    let promoted: Entry[] | undefined = cache.get('promoted');
    if (promoted === undefined) {
        try {
            promoted = (await fetchPromotedEntries()).filter(x => x);
            cache.set("promoted", promoted, 600);
        } catch (e) {
            promoted = [];
        }
    }

    return promoted.sort(() => Math.random() - 0.5);
}


export const getSearchIndexCount = async (): Promise<number> => {
    let indexCount: number | undefined = cache.get("index-count");
    if (indexCount === undefined) {
        try {
            indexCount = (await axios.get('https://hivesearcher.com/api/count').then(r => r.data)) as number
        } catch (e) {
            indexCount = 0;
        }

        cache.set("index-count", indexCount, 86400);
    }

    return indexCount;
}
