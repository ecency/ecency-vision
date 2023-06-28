import express from "express";

import { AppState } from "../../common/store";
import { Entry } from "../../common/store/entries/types";

import { makeGroupKey } from "../../common/store/entries";

import * as bridgeApi from "../../common/api/bridge";
import * as hiveApi from "../../common/api/hive";

import { makePreloadedState } from "../state";

import { optimizeEntries } from "../helper";

import { render } from "../template";
import { EntryFilter } from "../../common/store/global/types";
import { queryClient, QueryIdentifiers } from "../../common/core";
import isCommunity from "../../common/helper/is-community";

export default async (req: express.Request, res: express.Response) => {
  const { filter, name, section } = req.params;

  await queryClient.fetchQuery([QueryIdentifiers.COMMUNITY, name], () =>
    isCommunity(name) ? bridgeApi.getCommunity(name) : null
  );

  let accounts = [];

  try {
    let account = await hiveApi.getAccountFull(name);
    if (account) {
      accounts.push(account);
    }
  } catch (e) {}

  let entries: Entry[] = [];

  if (!section) {
    try {
      entries = (await bridgeApi.getPostsRanked(filter, "", "", 8, name)) || [];
    } catch (e) {
      entries = [];
    }
  }

  const state = await makePreloadedState(req);

  const preLoadedState: AppState = {
    ...state,
    global: {
      ...state.global,
      ...{ filter: EntryFilter[filter], tag: name }
    },
    entries: {
      ...state.entries,
      [`${makeGroupKey(filter, name)}`]: {
        entries: optimizeEntries(entries),
        error: null,
        sid: "",
        loading: false,
        hasMore: true
      }
    },
    accounts
  };

  res.send(render(req, preLoadedState));
};
