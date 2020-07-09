import express from "express";

import {initialState as globalInitialState} from "../../common/store/global";
import {initialState as dynamicPropsInitialState} from "../../common/store/dynamic-props";
import {initialState as trendingTagsInitialState} from "../../common/store/trending-tags";
import {initialState as communityInitialState} from "../../common/store/community";
import {initialState as transactionsInitialState} from "../../common/store/transactions";
import {initialState as usersInitialState} from "../../common/store/users";
import {initialState as activeUserInitialState} from "../../common/store/active-user";
import {initialState as reblogsInitialState} from "../../common/store/reblogs";
import {initialState as discussionsInitialState} from "../../common/store/discussions";

import {ProfileFilter} from "../../common/store/global/types";
import {Entry} from "../../common/store/entries/types";
import {makeGroupKey} from "../../common/store/entries";

import {readGlobalCookies, optimizeEntries} from "../helper";

import * as hiveApi from "../../common/api/hive";
import * as bridgeApi from "../../common/api/bridge";

import defaults from "../../common/constants/defaults.json";

import {render} from "../template";

import {cache} from "../cache";

export default async (req: express.Request, res: express.Response) => {
    const {username, section = "blog"} = req.params;
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

    // TODO: promoted posts

    const filter = ProfileFilter[section] || defaults.filter;
    const tag = ProfileFilter[section] ? address : "";

    const preLoadedState = {
        global: {
            ...globalInitialState,
            ...readGlobalCookies(req),
            ...{filter, tag},
        },
        dynamicProps: dynamicPropsInitialState,
        trendingTags: {...trendingTagsInitialState},
        community: communityInitialState,
        accounts: accounts,
        transactions: {...transactionsInitialState},
        users: usersInitialState,
        activeUser: activeUserInitialState,
        reblogs: reblogsInitialState,
        discussions: discussionsInitialState,
        entries,
    };

    res.send(render(req, preLoadedState));
};
