import express from "express";

import {AppState} from "../common/store";

import initialState from "../common/store/initial-state";

import {getSearchIndexCount, getActiveUser} from "./helper";

export const makePreloadedState = async (req: express.Request): Promise<AppState> => {
    const activeUser = getActiveUser(req);

    return {
        ...initialState,
        global: {
            ...initialState.global,
            searchIndexCount: await getSearchIndexCount(),
            canUseWebp: req.headers.accept !== undefined && req.headers.accept.indexOf("image/webp") !== -1
        },
        activeUser: activeUser ? {
            username: activeUser,
            data: {name: activeUser},
            points: {
                points: "0.000",
                uPoints: "0.000"
            }
        } : initialState.activeUser,
    }
}
