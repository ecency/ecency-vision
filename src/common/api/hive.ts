import { Client } from "@esteemapp/dhive";

import { TrendingTag } from "../store/trending-tags/types";
import { Account } from "../store/accounts/types";

import SERVERS from "../constants/servers.json";

let client = new Client(SERVERS, {
  timeout: 3000,
});

export const getTrendingTags = (afterTag: string = "", limit: number = 50): Promise<string[]> =>
  client.database.call("get_trending_tags", [afterTag, limit]).then((t: TrendingTag[]) => t.filter((x) => x.name !== "").map((x) => x.name));

export const getAccounts = (usernames: string[]): Promise<Account[]> => client.database.getAccounts(usernames);

export const getAccount = (username: string): Promise<Account> => client.database.getAccounts([username]).then((resp) => resp[0]);
