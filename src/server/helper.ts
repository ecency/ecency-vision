import express from "express";

import { ListStyle, Theme } from "../common/store/global/types";
import { Entry } from "../common/store/entries/types";

import defaults from "../common/constants/defaults.json";

import {apiRequest} from "./handlers/private-api";
import {getPost} from "../common/api/bridge";

import {cache} from "./cache";

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

  return { theme: Theme[theme], listStyle: ListStyle[listStyle], intro };
};

export const optimizeEntries = (entries: Entry[]): Entry[] => {
  return entries.map((x) => {
    return {
      ...x,
      ...{ active_votes: [] }, // remove active votes
    };
  });
};

export const fetchPromotedEntries = async (): Promise<Entry[]> => {
    // fetch list from api
    const list: { author: string, permlink: string }[] = (await apiRequest('promoted-posts?limit=200', 'GET')).data;

    // random sort & random pick 6
    const promoted = list.sort(() => Math.random() - 0.5).filter((x, i) => i < 6);

    // get post data
    const promises = promoted.map(x => getPost(x.author, x.permlink));

    return await Promise.all(promises) as Entry[];
}

export const getPromotedEntries = async (): Promise<Entry[]> => {
    let promoted: Entry[] | undefined = cache.get('promoted');
    if (promoted === undefined) {
        try {
            promoted = await fetchPromotedEntries();
            cache.set("promoted", promoted, 600);
        } catch (e) {
            promoted = [];
        }
    }

    return promoted;
}

