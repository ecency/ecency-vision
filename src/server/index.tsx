import express from "express";

import cookieParser from "cookie-parser";

import { EntryFilter, ProfileFilter } from "../common/store/global/types";

import entryIndexHandler from "./handlers/entry-index";
import profileHandler from "./handlers/profile";
import entryHandler from "./handlers/entry";
import fallbackHandler from "./handlers/fallback";
import { entryRssHandler, authorRssHandler } from "./handlers/rss";
import { receivedVestingHandler } from "./handlers/private-api";

const server = express();

const entryFilters = Object.values(EntryFilter);
const profileFilters = Object.values(ProfileFilter);

server
  .disable("x-powered-by")
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
  .use(cookieParser())
  .use(
    [
      `^/:filter(${entryFilters.join("|")})/:tag/rss.xml$`, // /trending/esteem/rss.xml
    ],
    entryRssHandler
  )
  .use(
    [
      "^/@:author/:section(feed|blog)/rss.xml$", // /blog/@esteemapp/rss.xml
      "^/@:author/rss.xml$", // @esteemapp/rss.xml
    ],
    authorRssHandler
  )
  .use(
    [
      "^/$", // index
      `^/:filter(${entryFilters.join("|")})$`, // /trending
      `^/:filter(${entryFilters.join("|")})/:tag$`, //  /trending/esteem
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
  .get("^/received-vesting/:username$", receivedVestingHandler)
  .get("*", fallbackHandler);

export default server;
