import express from "express";

import {AppState} from "../../common/store";

import {makePreloadedState} from "../state";

import {readGlobalCookies, getPromotedEntries, optimizeEntries} from "../helper";

import {render} from "../template";

export default async (req: express.Request, res: express.Response) => {

    const state = makePreloadedState();

    const preLoadedState: AppState = {
        ...state,
        global: {
            ...state.global,
            ...readGlobalCookies(req),
        },
        entries: {
            ...state.entries,
            ["__promoted__"]: {
                entries: optimizeEntries(await getPromotedEntries()),
                error: null,
                loading: false,
                hasMore: true,
            }
        },
    }

    res.send(render(req, preLoadedState));
};
