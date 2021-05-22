import express from "express";

import cookieParser from "cookie-parser";

import {EntryFilter, ProfileFilter} from "../common/store/global/types";

import entryIndexHandler from "./handlers/entry-index";
import communityHandler from "./handlers/community";
import profileHandler from "./handlers/profile";
import entryHandler from "./handlers/entry";
import fallbackHandler, {healthCheck} from "./handlers/fallback";
import {entryRssHandler, authorRssHandler} from "./handlers/rss";

const server = express();

const entryFilters = Object.values(EntryFilter);
const profileFilters = Object.values(ProfileFilter);

const lowerCase = (req: any, res: any, next: any) => {
    if (req.url !== req.url.toLowerCase()) {
        res.redirect(301, req.url.toLowerCase());
    }
    else {
        next();
    }
}

const stripSlash = (req: any, res: any, next: any) => {
    if (req.path.substr(-1) === '/' && req.path.length > 1) {
        let query = req.url.slice(req.path.length);
        res.redirect(301, req.path.slice(0, -1) + query);
    } else {
        next();
    }
}

server
    .disable("x-powered-by")
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
    .use(express.json())
    .use(cookieParser())
    .use(lowerCase)
    .use(stripSlash)

    // Common backend
    .get(
        [
            `^/:filter(${entryFilters.join("|")})/:tag/rss.xml$`, // /trending/esteem/rss.xml
        ],
        entryRssHandler
    )
    .get(
        [
            "^/@:author/:section(feed|blog|posts)/rss.xml$", // /posts/@esteemapp/rss.xml
            "^/@:author/rss.xml$", // @esteemapp/rss.xml
        ],
        authorRssHandler
    )
    .get(
        [
            `^/:filter(${entryFilters.join("|")}|subscribers|activities|roles)/:name(hive-[\\d]+)$`, //  /hot/hive-231312
        ],
        communityHandler
    )
    .get(
        [
            "^/$", // index
            `^/:filter(${entryFilters.join("|")})$`, // /trending
            `^/:filter(${entryFilters.join("|")})/:tag$`, //  /trending/esteem
            `^/@:tag/:filter(feed)$`, //  /@user/feed
        ],
        entryIndexHandler
    )
    .get(
        [
            "^/@:username$", // /@esteemapp
            `^/@:username/:section(${profileFilters.join("|")}|communities|wallet|points|settings)$`, // /@esteemapp/comments
        ],
        profileHandler
    )
    .get(
        [
            "^/:category/@:author/:permlink$", // /esteem/@esteemapp/rss-feeds-added-into-esteem-website
            "^/@:author/:permlink$", // /@esteemapp/rss-feeds-added-into-esteem-website
        ],
        entryHandler
    )

    // Health check script for docker swarm
    .get("^/healthcheck.json$", healthCheck)

    // For all others paths
    .get("*", fallbackHandler);

export default server;
