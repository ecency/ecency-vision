import {Request, Response} from "express";
import { renderAmpBody } from "@ecency/render-helper-amp";
import redis from 'redis';
import { promisify } from "util";

import {AppState} from "../../common/store";
import {Entry} from "../../common/store/entries/types";

import * as bridgeApi from "../../common/api/bridge";

import {makePreloadedState} from "../state";

import {render} from "../template";

const client = redis.createClient();
client.on("error", function(error: object) {
  console.error(error);
});

const redisGetAsync = promisify(client.get).bind(client);
const redisSetAsync = promisify(client.set).bind(client);

export default async (req: Request, res: Response) => {
    const {category, author, permlink} = req.params;
    const {isamp} = req.query;

    let entry: Entry | null = null;

    try {
        entry = await bridgeApi.getPost(author, permlink);
    } catch (e) {
        console.error('ERROR', e);
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
        },
        entries: {
            ...state.entries,
            ...entries
        },
    }

    if(isamp === "1"){
        const value = await redisGetAsync(`${category}_${author}_${permlink}`);
        if(value) return res.send(value);

        const ampBody = await renderAmpBody(render(req, preLoadedState));
        await redisSetAsync(`${category}_${author}_${permlink}`, ampBody);

        return ampBody;
    }

    res.send(render(req, preLoadedState));
};
