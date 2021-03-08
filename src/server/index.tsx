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

const server = express();

const entryFilters = Object.values(EntryFilter);
const profileFilters = Object.values(ProfileFilter);

server
    .disable("x-powered-by")
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
    .use(express.json())
    .use(cookieParser())

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
    .post("^/api/search$", searchApi.search)
    .post("^/api/search-follower$", searchApi.searchFollower)
    .post("^/api/search-following$", searchApi.searchFollowing)
    .post("^/api/search-account$", searchApi.searchAccount)
    .post("^/api/search-tag$", searchApi.searchTag)
    .post("^/api/search-path$", searchApi.searchPath)

    // Private Api
    .get("^/api/received-vesting/:username$", privateApi.receivedVesting)
    .get("^/api/rewarded-communities$", privateApi.rewardedCommunities)
    .get("^/api/leaderboard/:duration(day|week|month)$", privateApi.leaderboard)
    .get("^/api/promoted-entries$", privateApi.promotedEntries)
    .post("^/api/comment-history$", privateApi.commentHistory)
    .post("^/api/points$", privateApi.points)
    .post("^/api/point-list$", privateApi.pointList)
    .post("^/api/account-create$", privateApi.createAccount)
    .post("^/api/hs-token-refresh$", privateApi.hsTokenRefresh)
    /* Login required private api endpoints */
    .post("^/api/notifications$", privateApi.notifications)
    .post("^/api/notifications/unread$", privateApi.unreadNotifications)
    .post("^/api/notifications/mark$", privateApi.markNotifications)
    .post("^/api/usr-activity$", privateApi.usrActivity)
    .post("^/api/images$", privateApi.images)
    .post("^/api/images-delete$", privateApi.imagesDelete)
    .post("^/api/images-add$", privateApi.imagesAdd)
    .post("^/api/drafts$", privateApi.drafts)
    .post("^/api/drafts-add$", privateApi.draftsAdd)
    .post("^/api/drafts-update$", privateApi.draftsUpdate)
    .post("^/api/drafts-delete$", privateApi.draftsDelete)
    .post("^/api/bookmarks$", privateApi.bookmarks)
    .post("^/api/bookmarks-add$", privateApi.bookmarksAdd)
    .post("^/api/bookmarks-delete$", privateApi.bookmarksDelete)
    .post("^/api/schedules$", privateApi.schedules)
    .post("^/api/schedules-add$", privateApi.schedulesAdd)
    .post("^/api/schedules-delete$", privateApi.schedulesDelete)
    .post("^/api/schedules-move$", privateApi.schedulesMove)
    .post("^/api/favorites$", privateApi.favorites)
    .post("^/api/favorites-check$", privateApi.favoritesCheck)
    .post("^/api/favorites-add$", privateApi.favoritesAdd)
    .post("^/api/favorites-delete$", privateApi.favoritesDelete)
    .post("^/api/fragments$", privateApi.fragments)
    .post("^/api/fragments-add$", privateApi.fragmentsAdd)
    .post("^/api/fragments-update$", privateApi.fragmentsUpdate)
    .post("^/api/fragments-delete$", privateApi.fragmentsDelete)
    .post("^/api/points-claim$", privateApi.pointsClaim)
    .post("^/api/points-calc$", privateApi.pointsCalc)
    .post("^/api/promote-price$", privateApi.promotePrice)
    .post("^/api/promoted-post$", privateApi.promotedPost)
    .post("^/api/boost-options$", privateApi.boostOptions)
    .post("^/api/boosted-post$", privateApi.boostedPost)

    // For all others paths
    .get("*", fallbackHandler)

    // Health check script for docker swarm
    .get("^/healthcheck.json$", healthCheck);

export default server;
