import express from "express";

import cookieParser from "cookie-parser";

import { EntryFilter, ProfileFilter } from "../common/store/global/types";

import entryIndexHandler from "./handlers/entry-index";
import communityHandler from "./handlers/community";
import profileHandler from "./handlers/profile";
import entryHandler from "./handlers/entry";
import fallbackHandler, { healthCheck, iosURI, androidURI, nodeList } from "./handlers/fallback";
import { entryRssHandler, authorRssHandler } from "./handlers/rss";
import * as authApi from "./handlers/auth-api";
import { cleanURL, authCheck, stripLastSlash } from "./util";
import { coingeckoHandler } from "./handlers/coingecko.handler";
import config from "../config";
import defaults from "../common/constants/defaults.json";

const server = express();

const entryFilters = Object.values(EntryFilter);
const profileFilters = Object.values(ProfileFilter);

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
      `^/:filter(${entryFilters.join("|")})/:tag/rss.xml$` // /trending/ecency/rss.xml
    ],
    entryRssHandler
  )
  .get(
    [
      "^/@:author/:section(feed|blog|posts)/rss.xml$", // /posts/@ecency/rss.xml
      "^/@:author/rss.xml$", // @ecency/rss.xml
      "^/@:author/rss$" //@ecency/rss
    ],
    authorRssHandler
  )
  .get(
    [
      `^/:filter(${entryFilters.join("|")}|subscribers|activities|roles)/:name(hive-[\\d]+)$` //  /hot/hive-231312
    ],
    communityHandler
  )
  .get(
    [
      "^/$", // index
      `^/:filter(${entryFilters.join("|")})$`, // /trending
      `^/:filter(${entryFilters.join("|")})/:tag$`, //  /trending/esteem
      `^/@:tag/:filter(feed)$` //  /@user/feed
    ],
    entryIndexHandler
  )
  .get(
    [
      "^/@:username$", // /@esteemapp
      `^/@:username/:section(${profileFilters.join(
        "|"
      )}|communities|wallet|points|engine|settings|permissions|referrals|followers|following|spk)$` // /@esteemapp/comments
    ],
    profileHandler
  )
  .get(
    [
      "^/:category/@:author/:permlink$", // /esteem/@esteemapp/rss-feeds-added-into-esteem-website
      "^/@:author/:permlink$" // /@esteemapp/rss-feeds-added-into-esteem-website
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
  // CoinGecko market rate API
  .get("^/coingecko/api/v3/simple/price$", coingeckoHandler)
  // For all others paths
  .get("*", fallbackHandler);

if (
  config.hsClientId === "ecency.app" &&
  defaults.base === "https://ecency.com" &&
  config.hsClientSecret.length === 0
) {
  // Use Ecency servers
} else if (
  config.hsClientId === "ecency.app" ||
  defaults.base === "https://ecency.com" ||
  config.hsClientSecret.length === 0 ||
  config.usePrivate === "1"
) {
  console.error("configurationError:", {
    base: defaults.base,
    hsClientId: config.hsClientId,
    hsClientSecret: config.hsClientSecret,
    usePrivate: config.usePrivate
  });
  process.exit(1);
}

export default server;
