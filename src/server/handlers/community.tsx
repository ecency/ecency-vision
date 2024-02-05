import express from "express";

import { AppState } from "../../common/store";
import { Community } from "../../common/store/communities/types";
import { Entry } from "../../common/store/entries/types";

import { makeGroupKey } from "../../common/store/entries";

import * as bridgeApi from "../../common/api/bridge";
import * as hiveApi from "../../common/api/hive";

import { makePreloadedState } from "../state";

import { optimizeEntries } from "../helper";

import { render } from "../template";
import { EntryFilter } from "../../common/store/global/types";

export default async (req: express.Request, res: express.Response) => {
  const { filter, name, section } = req.params;

  let communities: Community[] = [];
  try {
    const community = await bridgeApi.getCommunity(name);
    if (community) {
      communities = [community];
    }
  } catch (e) {}

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
      ...{ filter: EntryFilter[filter as EntryFilter], tag: name },
    },
    entries: {
      ...state.entries,
      [`${makeGroupKey(filter, name)}`]: {
        entries: optimizeEntries(entries),
        error: null,
        loading: false,
        hasMore: true,
      },
    },
    communities,
    accounts,
  };

  res.send(render(req, preLoadedState));
};
