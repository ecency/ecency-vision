import express from "express";

import { initialState as globalInitialState } from "../../common/store/global/index";
import { initialState as trendingTagsInitialState } from "../../common/store/trending-tags/index";
import { initialState as communityInitialState } from "../../common/store/community/index";

import { Filter } from "../../common/store/global/types";
import { Entry } from "../../common/store/entries/types";
import { makeGroupKey } from "../../common/store/entries/index";

import { readGlobalCookies, optimizeEntries } from "../helper";

import * as hiveApi from "../../common/api/hive";

import filterTagExtract from "../../common/helper/filter-tag-extract";

import { render } from "../template";

import { cache } from "../cache";

export default async (req: express.Request, res: express.Response) => {
  const params = filterTagExtract(req.originalUrl)!;
  const { filter, tag } = params;
  const username = tag.replace("@", "");

  let entries: Entry[];

  try {
    entries = (await hiveApi.getAccountPosts(filter, username, "", "", 10)) || [];
  } catch (e) {
    entries = [];
  }

  let profiles = [];

  try {
    let profile = (await hiveApi.getProfile(username)) || null;
    if (profile) {
      profiles.push(profile);
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
    profiles: profiles,
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
