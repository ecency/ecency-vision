import { Client } from "@esteemapp/dhive";

import { TrendingTag } from "../store/trending-tags/types";
import { Account, AccountProfile, AccountFollowStats } from "../store/accounts/types";

import SERVERS from "../constants/servers.json";

export let client = new Client(SERVERS, {
  timeout: 3000,
});

export interface Vote {
  percent: number;
  rshares: string;
  time: string;
  timestamp?: number;
  voter: string;
  weight: number;
  reward?: number;
}

export interface DynamicGlobalProperties {
  total_vesting_fund_hive: string;
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

export interface VestingDelegation {
  delegatee: string;
  delegator: string;
  id: number;
  min_delegation_time: string;
  vesting_shares: string;
}

export const getActiveVotes = (author: string, permlink: string): Promise<Vote[]> =>
  client.database.call("get_active_votes", [author, permlink]);

export const getTrendingTags = (afterTag: string = "", limit: number = 50): Promise<string[]> =>
  client.database
    .call("get_trending_tags", [afterTag, limit])
    .then((t: TrendingTag[]) => t.filter((x) => x.name !== "").map((x) => x.name));

export const lookupAccounts = (q: string, limit = 50): Promise<string[]> =>
  client.database.call("lookup_accounts", [q, limit]);

export const getAccounts = (usernames: string[]): Promise<Account[]> => {
  return client.database.getAccounts(usernames).then((resp: any[]): Account[] =>
    resp.map((x) => ({
      name: x.name,
      post_count: x.post_count,
      created: x.created,
      reputation: x.reputation,
      json_metadata: x.json_metadata,
      reward_steem_balance: x.reward_steem_balance,
      reward_sbd_balance: x.reward_sbd_balance,
      reward_vesting_steem: x.reward_vesting_steem,
      balance: x.balance,
      sbd_balance: x.sbd_balance,
      savings_balance: x.savings_balance,
      savings_sbd_balance: x.savings_sbd_balance,
      next_vesting_withdrawal: x.next_vesting_withdrawal,
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
    total_vesting_fund_hive: r.total_vesting_fund_hive || r.total_vesting_fund_steem,
    total_vesting_shares: r.total_vesting_shares,
  }));

export const getState = (path: string): Promise<any> => client.database.getState(path);

export const getFeedHistory = (): Promise<FeedHistory> => client.database.call("get_feed_history");

export const getRewardFund = (): Promise<RewardFund> => client.database.call("get_reward_fund", ["post"]);

export const getVestingDelegations = (
  username: string,
  from: string = "",
  limit: number = 50
): Promise<VestingDelegation[]> => client.database.call("get_vesting_delegations", [username, from, limit]);

export const vpMana = (account: Account): number => {
  // @ts-ignore "Account" is compatible with dhive's "ExtendedAccount"
  const calc = client.rc.calculateVPMana(account);
  const { percentage } = calc;
  return percentage / 100;
};
