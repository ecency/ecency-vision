import express from "express";

import cookieParser from "cookie-parser";

import {EntryFilter, ProfileFilter} from "../common/store/global/types";

import entryIndexHandler from "./handlers/entry-index";
import profileHandler from "./handlers/profile";
import entryHandler from "./handlers/entry";
import fallbackHandler from "./handlers/fallback";
import {entryRssHandler, authorRssHandler} from "./handlers/rss";
import {receivedVesting, notifications, unreadNotificationCount, hsTokenRefresh, createAccount, usrActivity} from "./handlers/private-api";

const server = express();

const entryFilters = Object.values(EntryFilter);
const profileFilters = Object.values(ProfileFilter);

server
    .disable("x-powered-by")
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
    .use(express.json())
    .use(cookieParser())
    .use(
        [
            `^/:filter(${entryFilters.join("|")})/:tag/rss.xml$`, // /trending/esteem/rss.xml
        ],
        entryRssHandler
    )
    .use(
        [
            "^/@:author/:section(feed|blog|posts)/rss.xml$", // /posts/@esteemapp/rss.xml
            "^/@:author/rss.xml$", // @esteemapp/rss.xml
        ],
        authorRssHandler
    )
    .use(
        [
            "^/$", // index
            `^/:filter(${entryFilters.join("|")})$`, // /trending
            `^/:filter(${entryFilters.join("|")})/:tag$`, //  /trending/esteem
            `^/@:tag/:filter(feed)$`, //  /@user/feed
        ],
        entryIndexHandler
    )
    .use(
        [
            "^/@:username$", // /@esteemapp
            `^/@:username/:section(${profileFilters.join("|")}|wallet)$`, // /@esteemapp/comments
        ],
        profileHandler
    )
    .use(
        [
            "^/:category/@:author/:permlink$", // /esteem/@esteemapp/rss-feeds-added-into-esteem-website
            "^/@:author/:permlink$", // /@esteemapp/rss-feeds-added-into-esteem-website
        ],
        entryHandler
    )
    .use("^/api/received-vesting/:username$", receivedVesting)
    .post("^/api/notifications/:username$", notifications)
    .post("^/api/notifications/:username/unread-count$", unreadNotificationCount)
    .post("^/api/hs-token-refresh$", hsTokenRefresh)
    .post("^/api/usr-activity$", usrActivity)
    .post("^/api/account-create$", createAccount)
    .get("*", fallbackHandler);

export default server;
