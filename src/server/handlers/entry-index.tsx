import express from "express";

import React from "react";
import { Provider } from "react-redux";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";

import configureStore from "../../common/store/configure";

import { initialState as globalInitialState } from "../../common/store/global/index";
import { initialState as trendingTagsInitialState } from "../../common/store/trending-tags/index";
import { initialState as communityInitialState } from "../../common/store/community/index";

import { Filter } from "../../common/store/global/types";
import { Entry } from "../../common/store/entries/types";
import { Community } from "../../common/store/community/types";
import { makeGroupKey } from "../../common/store/entries/index";

import { readGlobalCookies } from "../helper";

import App from "../../common/app";

import * as hiveApi from "../../common/api/hive";

import filterTagExtract from "../../common/helper/filter-tag-extract";

import { render } from "../template";

import { cache } from "../cache";

export default async (req: express.Request, res: express.Response) => {
  const params = filterTagExtract(req.originalUrl)!;
  const { filter, tag } = params;

  let entries: Entry[];

  try {
    entries = await hiveApi.getPostsRanked(filter, "", "", 13, tag);
  } catch (e) {
    entries = [];
  }

  // some optimization to reduce server output size.
  entries = entries.map((x) => {
    return {
      ...x,
      ...{ active_votes: [] }, // remove active votes
    };
  });

  let community: Community | null = null;
  if (tag.startsWith("hive-")) {
    try {
      community = await hiveApi.getCommunity(tag);
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
    entries: {
      [`${makeGroupKey(filter, tag)}`]: {
        entries: entries,
        error: null,
        loading: false,
        hasMore: true,
      },
    },
  };

  const store = configureStore(preLoadedState);

  const context = {};

  const markup = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    </Provider>
  );

  const finalState = store.getState();

  res.send(render(markup, finalState));
};
