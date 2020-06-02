import { Client } from "@esteemapp/dhive";

import { Entry } from "../store/entries/types";
import { TrendingTag } from "../store/trending-tags/types";

import SERVERS from "../constants/servers.json";

let client = new Client(SERVERS, {
  timeout: 3000,
});

export const getTrendingTags = (afterTag: string = "", limit: number = 50): Promise<string[]> =>
  client.database.call("get_trending_tags", [afterTag, limit]).then((t: TrendingTag[]) => t.filter((x) => x.name !== "").map((x) => x.name));
