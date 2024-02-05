import express from "express";

import { AppState } from "../../common/store";
import { ProfileFilter } from "../../common/store/global/types";
import { Entry } from "../../common/store/entries/types";
import { makeGroupKey } from "../../common/store/entries";

import defaults from "../../common/constants/defaults.json";

import { optimizeEntries } from "../helper";

import * as hiveApi from "../../common/api/hive";
import * as bridgeApi from "../../common/api/bridge";

import { makePreloadedState } from "../state";

import { render } from "../template";

export default async (req: express.Request, res: express.Response) => {
  const { username, section = "blog" } = req.params;
  const address = `@${username}`;

  let entries = {};

  // blog or comments or replies section
  if (ProfileFilter[section]) {
    let entryList: Entry[] = [];

    try {
      entryList =
        (await bridgeApi.getAccountPosts(
          section,
          username,
          "",
          "",
          bridgeApi.dataLimit
        )) || [];
    } catch (e) {
      entryList = [];
    }

    entries = {
      [`${makeGroupKey(section, address)}`]: {
        entries: optimizeEntries(entryList),
        error: null,
        loading: false,
        hasMore: true,
      },
    };
  }

  let accounts = [];

  try {
    let account = await hiveApi.getAccountFull(username);
    if (account) {
      accounts.push(account);
    }
  } catch (e) {}

  const filter = ProfileFilter[section as ProfileFilter] || defaults.filter;
  const tag = ProfileFilter[section as ProfileFilter] ? address : "";

  const state = await makePreloadedState(req);

  const preLoadedState: AppState = {
    ...state,
    global: {
      ...state.global,
      ...{ filter, tag },
    },
    accounts: accounts,
    entries: {
      ...state.entries,
      ...entries,
    },
  };

  res.send(render(req, preLoadedState));
};
