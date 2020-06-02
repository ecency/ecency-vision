import express from "express";

import { initialState as globalInitialState } from "../../common/store/global/index";
import { initialState as trendingTagsInitialState } from "../../common/store/trending-tags/index";
import { initialState as accountsInitialState } from "../../common/store/accounts/index";

import { Filter } from "../../common/store/global/types";
import { Entry } from "../../common/store/entries/types";
import { Community } from "../../common/store/community/types";
import { makeGroupKey } from "../../common/store/entries/index";

import { readGlobalCookies, optimizeEntries } from "../helper";

import * as hiveApi from "../../common/api/hive";
import * as bridgeApi from "../../common/api/bridge";

import filterTagExtract from "../../common/helper/filter-tag-extract";

import { render } from "../template";

import { cache } from "../cache";

export default async (req: express.Request, res: express.Response) => {
  const params = filterTagExtract(req.originalUrl)!;
  const { filter, tag } = params;

  let entries: Entry[];

  try {
    entries = (await bridgeApi.getPostsRanked(filter, "", "", 13, tag)) || [];
  } catch (e) {
    entries = [];
  }

  let community: Community | null = null;
  if (tag.startsWith("hive-")) {
    try {
      community = await bridgeApi.getCommunity(tag);
    } catch (e) {
      community = null;
    }
  }

  let tags: string[] | undefined = cache.get("trending-tags");
  if (tags === undefined) {
    tags = await hiveApi.getTrendingTags();
    cache.set("trending-tags", tags, 86400);
  }

  // TODO: promoted posts

  const preLoadedState = {
    global: {
      ...globalInitialState,
      ...readGlobalCookies(req),
      ...{ filter: Filter[filter], tag },
    },
    trendingTags: { ...trendingTagsInitialState, list: tags },
    community,
    accounts: accountsInitialState,
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
