import { Client } from "@esteemapp/dhive";

import { TrendingTag } from "../store/trending-tags/types";
import { Account, AccountProfile, AccountFollowStats } from "../store/accounts/types";

import SERVERS from "../constants/servers.json";

export let client = new Client(SERVERS, {
  timeout: 3000,
});

export const getTrendingTags = (afterTag: string = "", limit: number = 50): Promise<string[]> =>
  client.database
    .call("get_trending_tags", [afterTag, limit])
    .then((t: TrendingTag[]) => t.filter((x) => x.name !== "").map((x) => x.name));

export const getAccounts = (usernames: string[]): Promise<Account[]> => {
  return client.database.getAccounts(usernames).then((resp: any[]) =>
    resp.map((x) => {
      return {
        name: x.name,
        post_count: x.post_count,
        created: x.created,
        json_metadata: x.json_metadata,
      };
    })
  );
};

export const getAccount = (username: string): Promise<Account> => getAccounts([username]).then((resp) => resp[0]);

export const getAccountFull = (username: string): Promise<Account> =>
  getAccount(username).then(async (account) => {
    let profile: AccountProfile | undefined;
    try {
      profile = JSON.parse(account.json_metadata!).profile;
    } catch (e) {}

    let follow_stats: AccountFollowStats | undefined;
    try {
      follow_stats = await getFollowCount(username);
    } catch (e) {}

    return { ...account, profile, follow_stats };
  });

export const getFollowCount = (username: string): Promise<AccountFollowStats> =>
  client.database.call("get_follow_count", [username]);

export const vpMana = (account: Account): number => {
  return 0;
  /*
  const calc = client.rc.calculateVPMana(account);
  const { percentage } = calc;
  return percentage / 100;
  */
};
