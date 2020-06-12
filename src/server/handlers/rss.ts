import express from "express";

import RSS from "rss";

import defaults from "../../common/constants/defaults.json";

import {
  catchPostImage,
  postBodySummary,
  setProxyBase,
  // @ts-ignore
} from "@esteemapp/esteem-render-helpers";
setProxyBase(defaults.imageServer);

import { getPostsRanked } from "../../common/api/bridge";

export const entryRssHandler = async (req: express.Request, res: express.Response) => {
  const { filter, tag } = req.params;

  let entries;

  try {
    entries = await getPostsRanked(filter, "", "", 20, tag);
  } catch (e) {
    res.status(500).send("Server Error");
    return;
  }

  const feedOption = {
    title: "RSS Feed",
    feed_url: `${defaults.base}/${filter}/${tag}/rss.xml`,
    site_url: defaults.base,
    image_url: `${defaults.base}/logo512.png`,
  };

  let feed = new RSS(feedOption);

  entries!.forEach((x) => {
    feed.item({
      title: x.title,
      description: postBodySummary(x.body, 200),
      url: `${defaults.base}${x.url}`,
      categories: [x.category],
      author: x.author,
      date: x.created,
      enclosure: { url: catchPostImage(x.body) || "" },
    });
  });

  res.set("Content-Type", "text/xml");
  return res.send(feed.xml());
};
