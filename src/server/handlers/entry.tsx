import express from "express";

import {AppState} from "../../common/store";
import {Entry} from "../../common/store/entries/types";

import * as bridgeApi from "../../common/api/bridge";

import {readGlobalCookies, getPromotedEntries, optimizeEntries} from "../helper";

import {makePreloadedState} from "../state";

import {render} from "../template";

export default async (req: express.Request, res: express.Response) => {
    const {category, author, permlink} = req.params;
    let entry: Entry | null = null;

    try {
        entry = await bridgeApi.getPost(author, permlink);
    } catch (e) {
    }

    let entries = {};

    if (entry) {

        if (!category) {
            res.redirect(`/${entry.category}/@${author}/${permlink}`);
            return;
        }

        entries = {
            [`__manual__`]: {
                entries: [entry],
                error: null,
                loading: false,
                hasMore: true,
            },
        };
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
