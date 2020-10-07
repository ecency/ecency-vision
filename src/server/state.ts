import express from "express";

import {AppState} from "../common/store";

import initialState from "../common/store/initial-state";

import {Global, ListStyle, Theme} from "../common/store/global/types";

import defaults from "../common/constants/defaults.json";

import {getSearchIndexCount} from "./helper";

export const makePreloadedState = async (req: express.Request): Promise<AppState> => {
    const _c = (k: string): any => req.cookies[k];

    const activeUser = _c("active_user") || null;

    const theme = _c("theme") && Object.values(Theme).includes(_c("theme")) ? _c("theme") : defaults.theme;
    const listStyle = _c("list-style") && Object.values(ListStyle).includes(_c("list-style")) ? _c("list-style") : defaults.listStyle;
    const intro = !_c("hide-intro");

    const globalState: Global = {
        ...initialState.global,
        theme: Theme[theme],
        listStyle: ListStyle[listStyle],
        intro,
        searchIndexCount: await getSearchIndexCount(),
        canUseWebp: req.headers.accept !== undefined && req.headers.accept.indexOf("image/webp") !== -1
    };

    return {
        ...initialState,
        global: globalState,
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
