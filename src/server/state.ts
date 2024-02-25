import express from "express";

import { AppState } from "../common/store";

import initialState from "../common/store/initial-state";

import { Global, ListStyle, Theme } from "../common/store/global/types";

import { activeUserMaker } from "../common/store/helper";

import defaults from "../common/constants/defaults.json";

import config from "../config";

import { getSearchIndexCount, getDynamicProps } from "./helper";

import { getOperatingSystem } from "../common/util/platform";

export const makePreloadedState = async (
  req: express.Request
): Promise<AppState> => {
  const _c = (k: string): any => req.cookies[k];

  const activeUser = _c("active_user") || null;

  const theme =
    _c("theme") && Object.values(Theme).includes(_c("theme"))
      ? _c("theme")
      : "sky";
  const listStyle =
    _c("list-style") && Object.values(ListStyle).includes(_c("list-style"))
      ? _c("list-style")
      : defaults.listStyle;
  const intro = !_c("hide-intro");

  const globalState: Global = {
    ...initialState.global,
    theme: Theme[theme as Theme],
    listStyle: ListStyle[listStyle as ListStyle],
    intro,
    searchIndexCount: await getSearchIndexCount(),
    canUseWebp:
      req.headers.accept !== undefined &&
      req.headers.accept.indexOf("image/webp") !== -1,
    isMobile: !!(
      req.headers["user-agent"] &&
      ["iOS", "AndroidOS"].includes(
        getOperatingSystem(req.headers["user-agent"])
      )
    ),
    usePrivate: false,
    hive_id: config.hive_id,
    ctheme: config.theme,
    tags: [...config.tags],
    baseApiUrl: config.baseApiUrl,
  };

  const dynamicProps = await getDynamicProps();

  return {
    ...initialState,
    global: globalState,
    dynamicProps,
    activeUser: activeUser
      ? activeUserMaker(activeUser)
      : initialState.activeUser,
  };
};
