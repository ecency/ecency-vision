import express from "express";

import RSS from "rss";

import {Entry} from "../../common/store/entries/types";

import defaults from "../../common/constants/defaults.json";

import {
    catchPostImage,
    postBodySummary,
    setProxyBase,
    // @ts-ignore
} from "@ecency/render-helper";

setProxyBase(defaults.imageServer);

import {getPostsRanked, getAccountPosts} from "../../common/api/bridge";

const feedOptions = (req: express.Request) => {
    return {
        title: "RSS Feed",
        feed_url: `${defaults.base}${req.originalUrl}`,
        site_url: defaults.base,
        image_url: `${defaults.base}/logo512.png`,
    };
};

const feedItem = (x: Entry) => {
    return {
        title: x.title,
        description: postBodySummary(x.body, 200),
        url: `${defaults.base}${x.url}`,
        categories: [x.category],
        author: x.author,
        date: x.created,
        enclosure: {url: catchPostImage(x.body) || ""},
    };
};

export const entryRssHandler = async (req: express.Request, res: express.Response) => {
    const {filter, tag} = req.params;

    let entries: Entry[];

    try {
        entries = await getPostsRanked(filter, "", "", 20, tag) || [];
    } catch (e) {
        // Non existent tag error handler
        if (String(e).indexOf("Invalid parameters") !== -1) {
            entries = [];
        } else {
            res.status(500).send("Server Error");
            return;
        }
    }

    let feed = new RSS(feedOptions(req));

    entries.forEach((x) => {
        feed.item(feedItem(x));
    });

    res.set("Content-Type", "text/xml");
    return res.send(feed.xml());
};

export const authorRssHandler = async (req: express.Request, res: express.Response) => {
    const {author, section = "posts"} = req.params;

    let entries: Entry[];

    try {
        entries = await getAccountPosts(section, author) || [];
    } catch (e) {
        res.status(500).send("Server Error");
        return;
    }

    let feed = new RSS(feedOptions(req));

    entries.forEach((x) => {
        feed.item(feedItem(x));
    });

    res.set("Content-Type", "text/xml");
    return res.send(feed.xml());
};
