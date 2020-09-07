import express from "express";

import {AppState} from "../../common/store";
import {Community} from "../../common/store/communities/types";

import * as bridgeApi from "../../common/api/bridge";

import {makePreloadedState} from "../state";

import {readGlobalCookies, getPromotedEntries, optimizeEntries} from "../helper";

import {render} from "../template";
import {Entry} from "../../common/store/entries/types";
import {makeGroupKey} from "../../common/store/entries";

export default async (req: express.Request, res: express.Response) => {
    const {filter, name} = req.params;

    let communities: Community[] = [];
    try {
        const community = await bridgeApi.getCommunity(name);
        if (community) {
            communities = [community];
        }
    } catch (e) {
    }

    let entries: Entry[];

    try {
        entries = (await bridgeApi.getPostsRanked(filter, "", "", 8, name)) || [];
    } catch (e) {
        entries = [];
    }

    const state = await makePreloadedState(req);

    const preLoadedState: AppState = {
        ...state,
        global: {
            ...state.global,
            ...readGlobalCookies(req),
        },
        entries: {
            ...state.entries,
            [`${makeGroupKey(filter, name)}`]: {
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
        },
        communities
    }

    res.send(render(req, preLoadedState));
};
