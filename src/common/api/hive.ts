import { Client } from "@esteemapp/dhive";

import { TrendingTag } from "../store/trending-tags/types";
import { Account, AccountProfile, AccountFollowStats } from "../store/accounts/types";

import SERVERS from "../constants/servers.json";

export let client = new Client(SERVERS, {
  timeout: 3000,
});

export interface DynamicGlobalProperties {
  total_vesting_fund_steem: string;
  total_vesting_shares: string;
}

export interface FeedHistory {
  current_median_history: {
    base: string;
    quote: string;
  };
}

export interface RewardFund {
  recent_claims: string;
  reward_balance: string;
}

export const getTrendingTags = (afterTag: string = "", limit: number = 50): Promise<string[]> =>
  client.database
    .call("get_trending_tags", [afterTag, limit])
    .then((t: TrendingTag[]) => t.filter((x) => x.name !== "").map((x) => x.name));

export const getAccounts = (usernames: string[]): Promise<Account[]> => {
  return client.database.getAccounts(usernames).then((resp: any[]): Account[] =>
    resp.map((x) => ({
      name: x.name,
      post_count: x.post_count,
      created: x.created,
      reputation: x.reputation,
      json_metadata: x.json_metadata,
      vesting_shares: x.vesting_shares,
      delegated_vesting_shares: x.delegated_vesting_shares,
      received_vesting_shares: x.received_vesting_shares,
      vesting_withdraw_rate: x.vesting_withdraw_rate,
      to_withdraw: x.to_withdraw,
      withdrawn: x.withdrawn,
      voting_manabar: x.voting_manabar,
      __loaded: true,
    }))
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

export const getDynamicGlobalProperties = (): Promise<DynamicGlobalProperties> =>
  client.database.getDynamicGlobalProperties().then((r: any) => ({
    total_vesting_fund_steem: r.total_vesting_fund_steem,
    total_vesting_shares: r.total_vesting_shares,
  }));

export const getFeedHistory = (): Promise<FeedHistory> => client.database.call("get_feed_history");

export const getRewardFund = (): Promise<RewardFund> => client.database.call("get_reward_fund", ["post"]);

export const vpMana = (account: Account): number => {
  // @ts-ignore "Account" is compatible with dhive's "ExtendedAccount"
  const calc = client.rc.calculateVPMana(account);
  const { percentage } = calc;
  return percentage / 100;
};
