import express from "express";

import cookieParser from "cookie-parser";

import {EntryFilter, ProfileFilter} from "../common/store/global/types";

import entryIndexHandler from "./handlers/entry-index";
import communityHandler from "./handlers/community";
import profileHandler from "./handlers/profile";
import entryHandler from "./handlers/entry";
import fallbackHandler, {healthCheck} from "./handlers/fallback";
import {entryRssHandler, authorRssHandler} from "./handlers/rss";

import * as privateApi from "./handlers/private-api";
import * as searchApi from "./handlers/search-api";
import * as authApi from "./handlers/auth-api";

import config from "../config";

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

    // Search Api
    .post("^/search-api/search$", searchApi.search)
    .post("^/search-api/search-follower$", searchApi.searchFollower)
    .post("^/search-api/search-following$", searchApi.searchFollowing)
    .post("^/search-api/search-account$", searchApi.searchAccount)
    .post("^/search-api/search-tag$", searchApi.searchTag)
    .post("^/search-api/search-path$", searchApi.searchPath)

    // Auth Api
    .post("^/auth-api/hs-token-refresh$", authApi.hsTokenRefresh)

    // Private api check middleware
    .use((req: express.Request, res: express.Response, next: express.NextFunction) => {

        if (req.path.startsWith("/private-api/") && config.usePrivate !== "1") {
            res.status(403).send("Forbidden");
            return;
        }

        next();
    })
    // Private Api
    .get("^/private-api/received-vesting/:username$", privateApi.receivedVesting)
    .get("^/private-api/rewarded-communities$", privateApi.rewardedCommunities)
    .get("^/private-api/leaderboard/:duration(day|week|month)$", privateApi.leaderboard)
    .get("^/private-api/curation/:duration(day|week|month)$", privateApi.curation)
    .get("^/private-api/promoted-entries$", privateApi.promotedEntries)
    .post("^/private-api/comment-history$", privateApi.commentHistory)
    .post("^/private-api/points$", privateApi.points)
    .post("^/private-api/point-list$", privateApi.pointList)
    .post("^/private-api/account-create$", privateApi.createAccount)
    /* Login required private api endpoints */
    .post("^/private-api/notifications$", privateApi.notifications)
    .post("^/private-api/notifications/unread$", privateApi.unreadNotifications)
    .post("^/private-api/notifications/mark$", privateApi.markNotifications)
    .post("^/private-api/usr-activity$", privateApi.usrActivity)
    .post("^/private-api/images$", privateApi.images)
    .post("^/private-api/images-delete$", privateApi.imagesDelete)
    .post("^/private-api/images-add$", privateApi.imagesAdd)
    .post("^/private-api/drafts$", privateApi.drafts)
    .post("^/private-api/drafts-add$", privateApi.draftsAdd)
    .post("^/private-api/drafts-update$", privateApi.draftsUpdate)
    .post("^/private-api/drafts-delete$", privateApi.draftsDelete)
    .post("^/private-api/bookmarks$", privateApi.bookmarks)
    .post("^/private-api/bookmarks-add$", privateApi.bookmarksAdd)
    .post("^/private-api/bookmarks-delete$", privateApi.bookmarksDelete)
    .post("^/private-api/schedules$", privateApi.schedules)
    .post("^/private-api/schedules-add$", privateApi.schedulesAdd)
    .post("^/private-api/schedules-delete$", privateApi.schedulesDelete)
    .post("^/private-api/schedules-move$", privateApi.schedulesMove)
    .post("^/private-api/favorites$", privateApi.favorites)
    .post("^/private-api/favorites-check$", privateApi.favoritesCheck)
    .post("^/private-api/favorites-add$", privateApi.favoritesAdd)
    .post("^/private-api/favorites-delete$", privateApi.favoritesDelete)
    .post("^/private-api/fragments$", privateApi.fragments)
    .post("^/private-api/fragments-add$", privateApi.fragmentsAdd)
    .post("^/private-api/fragments-update$", privateApi.fragmentsUpdate)
    .post("^/private-api/fragments-delete$", privateApi.fragmentsDelete)
    .post("^/private-api/points-claim$", privateApi.pointsClaim)
    .post("^/private-api/points-calc$", privateApi.pointsCalc)
    .post("^/private-api/promote-price$", privateApi.promotePrice)
    .post("^/private-api/promoted-post$", privateApi.promotedPost)
    .post("^/private-api/boost-options$", privateApi.boostOptions)
    .post("^/private-api/boosted-post$", privateApi.boostedPost)

    // For all others paths
    .get("*", fallbackHandler)

    // Health check script for docker swarm
    .get("^/healthcheck.json$", healthCheck);

export default server;
