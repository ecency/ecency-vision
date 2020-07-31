import express from "express";

import {AppState} from "../../common/store";
import {EntryFilter} from "../../common/store/global/types";
import {Entry} from "../../common/store/entries/types";
import {Community} from "../../common/store/community/types";
import {makeGroupKey} from "../../common/store/entries";

import * as hiveApi from "../../common/api/hive";
import * as bridgeApi from "../../common/api/bridge";

import filterTagExtract from "../../common/helper/filter-tag-extract";

import {readGlobalCookies, optimizeEntries} from "../helper";
import {getPromotedEntries} from "../helper";

import {makePreloadedState} from "../state";

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
        cache.set("trending-tag", tags, 7200);
    }

    const state = makePreloadedState();

    const preLoadedState: AppState = {
        ...state,
        global: {
            ...state.global,
            ...readGlobalCookies(req),
            ...{filter: filter === "feed" ? filter : EntryFilter[filter], tag}, // TODO: AllFilter can be used
        },
        trendingTags: {
            ...state.trendingTags,
            list: tags
        },
        community,
        entries: {
            ...state.entries,
            [`${makeGroupKey(filter, tag)}`]: {
                entries: optimizeEntries(entries),
                error: null,
                loading: false,
                hasMore: true,
            },
            ["__promoted__"]: {
                entries: optimizeEntries(await getPromotedEntries()),
                error: null,
                loading: false,
                hasMore: true,
            }
        }
    }

    res.send(render(req, preLoadedState));
};
