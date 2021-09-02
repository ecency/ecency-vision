import {Request, Response} from "express";

import {AppState} from "../../common/store";
import {Entry} from "../../common/store/entries/types";

import * as bridgeApi from "../../common/api/bridge";

import {makePreloadedState} from "../state";

import {render} from "../template";
import dmca from '../../common/constants/dmca.json';

export default async (req: Request, res: Response) => {
    const {category, author, permlink} = req.params;
    let entry: Entry | null = null;

    try {
        entry = await bridgeApi.getPost(author, permlink);
    } catch (e) {
        console.error(`${new Date().toISOString()} ERROR fetching @${author}/${permlink}`);
    }

    let entries = {};

    if (entry) {
        if (dmca.includes(`${entry.author}/${entry.permlink}`)) {
            entry.body = "This post is not available due to a copyright/fraudulent claim.";
            entry.title = "";
        }
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
        },
        entries: {
            ...state.entries,
            ...entries
        },
    }

    res.send(render(req, preLoadedState));
};
