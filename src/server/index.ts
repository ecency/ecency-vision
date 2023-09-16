import express from "express";

import cookieParser from "cookie-parser";

import { EntryFilter, ProfileFilter } from "../common/store/global/types";

import entryIndexHandler from "./handlers/entry-index";
import communityHandler from "./handlers/community";
import profileHandler from "./handlers/profile";
import entryHandler from "./handlers/entry";
import fallbackHandler, {
  healthCheck,
  iosURI,
  androidURI,
  nodeList,
} from "./handlers/fallback";
import { entryRssHandler, authorRssHandler } from "./handlers/rss";
import * as authApi from "./handlers/auth-api";
import config from "../config";
import { pointsHandler } from "./handlers/points";

const server = express();

const entryFilters = Object.values(EntryFilter);
const profileFilters = Object.values(ProfileFilter);

const cleanURL = (req: any, res: any, next: any) => {
  if (req.url.includes("//")) {
    res.redirect(req.url.replace(new RegExp("/{2,}", "g"), "/"));
  }
  if (req.url.includes("-hs?code")) {
    next();
  } else if (
    req.url !== req.url.toLowerCase() &&
    !req.url.includes("auth?code")
  ) {
    res.redirect(301, req.url.toLowerCase());
  } else {
    next();
  }
};

const stripLastSlash = (req: any, res: any, next: any) => {
  if (req.path.substr(-1) === "/" && req.path.length > 1) {
    let query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
};

const authCheck = (req: any, res: any, next: any) => {
  if (config.hsClientSecret && config.usePrivate !== "1") {
    next();
  } else {
    res.json({
      error: "Define HIVESIGNER_SECRET ENV variable or set USE_PRIVATE=1",
    });
  }
};

server
  .disable("x-powered-by")
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
  .use("/assets", express.static(`${process.env.RAZZLE_PUBLIC_DIR!}/assets`))
  .use(express.json())
  .use(cookieParser())
  .use(cleanURL)
  .use(stripLastSlash)

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
      `^/:filter(${entryFilters.join(
        "|"
      )}|subscribers|activities|roles)/:name(hive-[\\d]+)$`, //  /hot/hive-231312
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
      `^/@:username/:section(${profileFilters.join(
        "|"
      )}|communities|wallet|points|engine|settings)$`, // /@esteemapp/comments
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
  // apple-app-site-association
  .get("^/apple-app-site-association$", iosURI)
  // android assetlinks
  .get("^/.well-known/assetlinks.json$", androidURI)
  // get public nodes list
  .get("^/public-nodes.json$", nodeList)
  // Auth Api
  .post("^/auth-api/hs-token-refresh$", authCheck, authApi.hsTokenRefresh)

  // Health check script for docker swarm
  .get("^/healthcheck.json$", healthCheck)
  .post("^/private-api/points", pointsHandler)

  // For all others paths
  .get("*", fallbackHandler);

export default server;
