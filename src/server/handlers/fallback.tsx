import express from "express";

import {AppState} from "../../common/store";

import {makePreloadedState} from "../state";

import {render} from "../template";

export default async (req: express.Request, res: express.Response) => {

    const state = await makePreloadedState(req);

    const preLoadedState: AppState = {
        ...state,
        global: {
            ...state.global,
        }
    }

    res.send(render(req, preLoadedState));
};
