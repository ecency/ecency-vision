import express from "express";

import { initialState as globalInitialState } from "../../common/store/global/index";
import { initialState as trendingTagsInitialState } from "../../common/store/trending-tags/index";
import { initialState as communityInitialState } from "../../common/store/community/index";

import { Filter } from "../../common/store/global/types";
import { Entry } from "../../common/store/entries/types";
import { makeGroupKey } from "../../common/store/entries/index";

import { readGlobalCookies, optimizeEntries } from "../helper";

import * as hiveApi from "../../common/api/hive";
import * as bridgeApi from "../../common/api/bridge";

import filterTagExtract from "../../common/helper/filter-tag-extract";

import defaults from "../../common/constants/defaults.json";

import { render } from "../template";

import { cache } from "../cache";

export default async (req: express.Request, res: express.Response) => {
  const params = filterTagExtract(req.originalUrl)!;
  let entries: Entry[] = [];

  let filter = defaults.filter;
  let tag = "";

  const { username, section = "blog" } = req.params;

  // blog or comments or replies section
  if (params) {
    ({ filter, tag } = params);

    try {
      entries = (await bridgeApi.getAccountPosts(section, username, "", "", 10)) || [];
    } catch (e) {
      entries = [];
    }
  }

  let accounts = [];

  try {
    let account = await hiveApi.getAccountFull(username);
    if (account) {
      accounts.push(account);
    }
  } catch (e) {}

  // TODO: promoted posts

  const preLoadedState = {
    global: {
      ...globalInitialState,
      ...readGlobalCookies(req),
      ...{ filter: Filter[filter], tag },
    },
    trendingTags: { ...trendingTagsInitialState },
    community: communityInitialState,
    accounts: accounts,
    entries: {
      [`${makeGroupKey(filter, tag)}`]: {
        entries: optimizeEntries(entries),
        error: null,
        loading: false,
        hasMore: true,
      },
    },
  };

  res.send(render(req, preLoadedState));
};
