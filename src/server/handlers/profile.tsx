import express from "express";

import {AppState} from "../../common/store";
import {ProfileFilter} from "../../common/store/global/types";
import {Entry} from "../../common/store/entries/types";
import {makeGroupKey} from "../../common/store/entries";

import defaults from "../../common/constants/defaults.json";

import {readGlobalCookies, getPromotedEntries, optimizeEntries} from "../helper";

import * as hiveApi from "../../common/api/hive";
import * as bridgeApi from "../../common/api/bridge";

import {makePreloadedState} from "../state";

import {render} from "../template";

export default async (req: express.Request, res: express.Response) => {
    const {username, section = "posts"} = req.params;
    const address = `@${username}`;

    let entries = {};

    // blog or comments or replies section
    if (ProfileFilter[section]) {
        let entryList: Entry[] = [];

        try {
            entryList = (await bridgeApi.getAccountPosts(section, username, "", "", 10)) || [];
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
    } catch (e) {
    }

    const filter = ProfileFilter[section] || defaults.filter;
    const tag = ProfileFilter[section] ? address : "";

    const state = await makePreloadedState();

    const preLoadedState: AppState = {
        ...state,
        global: {
            ...state.global,
            ...readGlobalCookies(req),
            ...{filter, tag},
        },
        accounts: accounts,
        entries: {
            ...state.entries,
            ...entries,
            ...{
                ["__promoted__"]: {
                    entries: optimizeEntries(await getPromotedEntries()),
                    error: null,
                    loading: false,
                    hasMore: true,
                }
            }
        },
    }

    res.send(render(req, preLoadedState));
};
