import express from "express";

import {initialState as globalInitialState} from "../../common/store/global";
import {initialState as dynamicPropsInitialState} from "../../common/store/dynamic-props";
import {initialState as trendingTagsInitialState} from "../../common/store/trending-tags";
import {initialState as accountsInitialState} from "../../common/store/accounts";
import {initialState as transactionsInitialState} from "../../common/store/transactions";
import {initialState as usersInitialState} from "../../common/store/users";
import {initialState as activeUserInitialState} from "../../common/store/active-user";
import {initialState as reblogsInitialState} from "../../common/store/reblogs";
import {initialState as discussionInitialState} from "../../common/store/discussion";

import {EntryFilter} from "../../common/store/global/types";
import {Entry} from "../../common/store/entries/types";
import {Community} from "../../common/store/community/types";
import {makeGroupKey} from "../../common/store/entries";

import {readGlobalCookies, optimizeEntries} from "../helper";
import {getPromotedEntries} from "../../common/helper/promoted";

import * as hiveApi from "../../common/api/hive";
import * as bridgeApi from "../../common/api/bridge";

import filterTagExtract from "../../common/helper/filter-tag-extract";

import {render} from "../template";

import {cache} from "../cache";

export default async (req: express.Request, res: express.Response) => {
    const params = filterTagExtract(req.originalUrl.split("?")[0])!;
    const {filter, tag} = params;

    let entries: Entry[];

    try {
        if (filter === "feed") {
            entries = (await bridgeApi.getAccountPosts(filter, tag.replace("@", ""), "", "", 13)) || [];
        } else {
            entries = (await bridgeApi.getPostsRanked(filter, "", "", 13, tag)) || [];
        }
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

    let tags: string[] | undefined = cache.get("trending-tag");
    if (tags === undefined) {
        tags = await hiveApi.getTrendingTags();
        cache.set("trending-tag", tags, 86400);
    }

    const preLoadedState = {
        global: {
            ...globalInitialState,
            ...readGlobalCookies(req),
            ...{filter: filter === "feed" ? filter : EntryFilter[filter], tag}, // TODO: AllFilter can be used
        },
        dynamicProps: dynamicPropsInitialState,
        trendingTags: {...trendingTagsInitialState, list: tags},
        community,
        accounts: accountsInitialState,
        transactions: {...transactionsInitialState},
        users: usersInitialState,
        activeUser: activeUserInitialState,
        reblogs: reblogsInitialState,
        discussion: discussionInitialState,
        entries: {
            [`${makeGroupKey(filter, tag)}`]: {
                entries: optimizeEntries(entries),
                error: null,
                loading: false,
                hasMore: true,
            },
            ['__promoted__']: {
                entries: getPromotedEntries(),
                error: null,
                loading: false,
                hasMore: true,
            }
        },
    };

    res.send(render(req, preLoadedState));
};
