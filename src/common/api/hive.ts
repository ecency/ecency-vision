import { Client, RCAPI, utils } from "@hiveio/dhive";

import { RCAccount } from "@hiveio/dhive/lib/chain/rc";

import { TrendingTag } from "../store/trending-tags/types";
import { DynamicProps } from "../store/dynamic-props/types";
import { FullAccount, AccountProfile, AccountFollowStats } from "../store/accounts/types";
import { Entry } from "../store/entries/types";

import parseAsset from "../helper/parse-asset";
import { vestsToRshares } from "../helper/vesting";
import isCommunity from "../helper/is-community";

import SERVERS from "../constants/servers.json";
import { dataLimit, getPost as getPostNew } from "./bridge";
import moment, { Moment } from "moment";
import { Entry } from "../store/entries/types";

export const client = new Client(SERVERS, {
  timeout: 3000,
  failoverThreshold: 3,
  consoleOnFailover: true
});

export interface Vote {
  percent: number;
  reputation: number;
  rshares: string;
  time: string;
  timestamp?: number;
  voter: string;
  weight: number;
  reward?: number;
}

export interface DynamicGlobalProperties {
  hbd_print_rate: number;
  total_vesting_fund_hive: string;
  total_vesting_shares: string;
  hbd_interest_rate: number;
  head_block_number: number;
  vesting_reward_percent: number;
  virtual_supply: string;
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

export interface DelegatedVestingShare {
  id: number;
  delegatee: string;
  delegator: string;
  min_delegation_time: string;
  vesting_shares: string;
}

export interface Follow {
  follower: string;
  following: string;
  what: string[];
}

export interface MarketStatistics {
  hbd_volume: string;
  highest_bid: string;
  hive_volume: string;
  latest: string;
  lowest_ask: string;
  percent_change: string;
}

export interface OpenOrdersData {
  id: number;
  created: string;
  expiration: string;
  seller: string;
  orderid: number;
  for_sale: number;
  sell_price: {
    base: string;
    quote: string;
  };
  real_price: string;
  rewarded: boolean;
}

export interface OrdersDataItem {
  created: string;
  hbd: number;
  hive: number;
  order_price: {
    base: string;
    quote: string;
  };
  real_price: string;
}

export interface MarketCandlestickDataItem {
  hive: {
    high: number;
    low: number;
    open: number;
    close: number;
    volume: number;
  };
  id: number;
  non_hive: {
    high: number;
    low: number;
    open: number;
    close: number;
    volume: number;
  };
  open: string;
  seconds: number;
}

export interface TradeDataItem {
  current_pays: string;
  date: number;
  open_pays: string;
}

export interface OrdersData {
  bids: OrdersDataItem[];
  asks: OrdersDataItem[];
  trading: OrdersDataItem[];
}

interface ApiError {
  error: string;
  data: any;
}

const handleError = (error: any) => {
  debugger;
  return { error: "api error", data: error };
};

export const getPost = (username: string, permlink: string): Promise<any> =>
  client.call("condenser_api", "get_content", [username, permlink]);

export const getMarketStatistics = (): Promise<MarketStatistics> =>
  client.call("condenser_api", "get_ticker", []);

export const getOrderBook = (limit: number = 500): Promise<OrdersData> =>
  client.call("condenser_api", "get_order_book", [limit]);

export const getOpenOrder = (user: string): Promise<OpenOrdersData[]> =>
  client.call("condenser_api", "get_open_orders", [user]);

export const getTradeHistory = (limit: number = 1000): Promise<OrdersDataItem[]> => {
  let todayEarlier = moment(Date.now()).subtract(10, "h").format().split("+")[0];
  let todayNow = moment(Date.now()).format().split("+")[0];
  return client.call("condenser_api", "get_trade_history", [todayEarlier, todayNow, limit]);
};

export const getMarketBucketSizes = (): Promise<number[]> =>
  client.call("condenser_api", "get_market_history_buckets", []);

export const getMarketHistory = (
  seconds: number,
  startDate: Moment,
  endDate: Moment
): Promise<MarketCandlestickDataItem[]> => {
  let todayEarlier = startDate.format().split("+")[0];
  let todayNow = endDate.format().split("+")[0];
  return client.call("condenser_api", "get_market_history", [seconds, todayEarlier, todayNow]);
};

export const getActiveVotes = (author: string, permlink: string): Promise<Vote[]> =>
  client.database.call("get_active_votes", [author, permlink]);

export const getTrendingTags = (afterTag: string = "", limit: number = 250): Promise<string[]> =>
  client.database.call("get_trending_tags", [afterTag, limit]).then((tags: TrendingTag[]) => {
    return tags
      .filter((x) => x.name !== "")
      .filter((x) => !isCommunity(x.name))
      .map((x) => x.name);
  });

export const getAllTrendingTags = (
  afterTag: string = "",
  limit: number = 250
): Promise<TrendingTag[] | any> =>
  client.database.call("get_trending_tags", [afterTag, limit]).then((tags: TrendingTag[]) => {
    return tags.filter((x) => x.name !== "").filter((x) => !isCommunity(x.name));
  });

export const lookupAccounts = (q: string, limit = 50): Promise<string[]> =>
  client.database.call("lookup_accounts", [q, limit]);

export const getAccounts = (usernames: string[]): Promise<FullAccount[]> => {
  return client.database.getAccounts(usernames).then((resp: any[]): FullAccount[] =>
    resp.map((x) => {
      const account: FullAccount = {
        name: x.name,
        owner: x.owner,
        active: x.active,
        posting: x.posting,
        memo_key: x.memo_key,
        post_count: x.post_count,
        created: x.created,
        reputation: x.reputation,
        posting_json_metadata: x.posting_json_metadata,
        last_vote_time: x.last_vote_time,
        last_post: x.last_post,
        json_metadata: x.json_metadata,
        reward_hive_balance: x.reward_hive_balance,
        reward_hbd_balance: x.reward_hbd_balance,
        reward_vesting_hive: x.reward_vesting_hive,
        reward_vesting_balance: x.reward_vesting_balance,
        balance: x.balance,
        hbd_balance: x.hbd_balance,
        savings_balance: x.savings_balance,
        savings_hbd_balance: x.savings_hbd_balance,
        savings_hbd_last_interest_payment: x.savings_hbd_last_interest_payment,
        savings_hbd_seconds_last_update: x.savings_hbd_seconds_last_update,
        savings_hbd_seconds: x.savings_hbd_seconds,
        next_vesting_withdrawal: x.next_vesting_withdrawal,
        vesting_shares: x.vesting_shares,
        delegated_vesting_shares: x.delegated_vesting_shares,
        received_vesting_shares: x.received_vesting_shares,
        vesting_withdraw_rate: x.vesting_withdraw_rate,
        to_withdraw: x.to_withdraw,
        withdrawn: x.withdrawn,
        witness_votes: x.witness_votes,
        proxy: x.proxy,
        recovery_account: x.recovery_account,
        proxied_vsf_votes: x.proxied_vsf_votes,
        voting_manabar: x.voting_manabar,
        voting_power: x.voting_power,
        downvote_manabar: x.downvote_manabar,
        __loaded: true
      };

      let profile: AccountProfile | undefined;

      try {
        profile = JSON.parse(x.posting_json_metadata!).profile;
      } catch (e) {}

      if (!profile) {
        try {
          profile = JSON.parse(x.json_metadata!).profile;
        } catch (e) {}
      }

      if (!profile) {
        profile = {
          about: "",
          cover_image: "",
          location: "",
          name: "",
          profile_image: "",
          website: ""
        };
      }

      return { ...account, profile };
    })
  );
};

export const getAccount = (username: string): Promise<FullAccount> =>
  getAccounts([username]).then((resp) => resp[0]);

export const getAccountFull = (username: string): Promise<FullAccount> =>
  getAccount(username).then(async (account) => {
    let follow_stats: AccountFollowStats | undefined;
    try {
      follow_stats = await getFollowCount(username);
    } catch (e) {}

    return { ...account, follow_stats };
  });

export const getFollowCount = (username: string): Promise<AccountFollowStats> =>
  client.database.call("get_follow_count", [username]);

export const getFollowing = (
  follower: string,
  startFollowing: string,
  followType = "blog",
  limit = 100
): Promise<Follow[]> =>
  client.database.call("get_following", [follower, startFollowing, followType, limit]);

export const getFollowers = (
  following: string,
  startFollowing: string,
  followType = "blog",
  limit = 100
): Promise<Follow[]> =>
  client.database.call("get_followers", [
    following,
    startFollowing === "" ? null : startFollowing,
    followType,
    limit
  ]);

export const findRcAccounts = (username: string): Promise<RCAccount[]> =>
  new RCAPI(client).findRCAccounts([username]);

export const getDynamicGlobalProperties = (): Promise<DynamicGlobalProperties> =>
  client.database.getDynamicGlobalProperties().then((r: any) => {
    return {
      total_vesting_fund_hive: r.total_vesting_fund_hive || r.total_vesting_fund_steem,
      total_vesting_shares: r.total_vesting_shares,
      hbd_print_rate: r.hbd_print_rate || r.sbd_print_rate,
      hbd_interest_rate: r.hbd_interest_rate,
      head_block_number: r.head_block_number,
      vesting_reward_percent: r.vesting_reward_percent,
      virtual_supply: r.virtual_supply
    };
  });

export const getAccountHistory = (
  username: string,
  filters: any[] | any,
  start: number = -1,
  limit: number = 20
): Promise<any> => {
  return filters
    ? client.call("condenser_api", "get_account_history", [username, start, limit, ...filters])
    : client.call("condenser_api", "get_account_history", [username, start, limit]);
};

export const getFeedHistory = (): Promise<FeedHistory> => client.database.call("get_feed_history");

export const getRewardFund = (): Promise<RewardFund> =>
  client.database.call("get_reward_fund", ["post"]);

export const getDynamicProps = async (): Promise<DynamicProps> => {
  const globalDynamic = await getDynamicGlobalProperties();
  const feedHistory = await getFeedHistory();
  const rewardFund = await getRewardFund();

  const hivePerMVests =
    (parseAsset(globalDynamic.total_vesting_fund_hive).amount /
      parseAsset(globalDynamic.total_vesting_shares).amount) *
    1e6;
  const base = parseAsset(feedHistory.current_median_history.base).amount;
  const quote = parseAsset(feedHistory.current_median_history.quote).amount;
  const fundRecentClaims = parseFloat(rewardFund.recent_claims);
  const fundRewardBalance = parseAsset(rewardFund.reward_balance).amount;
  const hbdPrintRate = globalDynamic.hbd_print_rate;
  const hbdInterestRate = globalDynamic.hbd_interest_rate;
  const headBlock = globalDynamic.head_block_number;
  const totalVestingFund = parseAsset(globalDynamic.total_vesting_fund_hive).amount;
  const totalVestingShares = parseAsset(globalDynamic.total_vesting_shares).amount;
  const virtualSupply = parseAsset(globalDynamic.virtual_supply).amount;
  const vestingRewardPercent = globalDynamic.vesting_reward_percent;

  return {
    hivePerMVests,
    base,
    quote,
    fundRecentClaims,
    fundRewardBalance,
    hbdPrintRate,
    hbdInterestRate,
    headBlock,
    totalVestingFund,
    totalVestingShares,
    virtualSupply,
    vestingRewardPercent
  };
};

export const getVestingDelegations = (
  username: string,
  from: string = "",
  limit: number = 50
): Promise<DelegatedVestingShare[]> =>
  client.database.call("get_vesting_delegations", [username, from, limit]);

export const getOutgoingRc = async (
  from: string,
  to: string = "",
  limit: number = 50
): Promise<any[]> => {
  const data = await client.call("rc_api", "list_rc_direct_delegations", {
    start: [from, to],
    limit: limit
  });
  return data;
};

export const getIncomingRc = async (user: string): Promise<any[]> => {
  const data = await fetch(`https://ecency.com/private-api/received-rc/${user}`)
    .then((res: any) => res.json())
    .then((r: any) => r);
  return data;
};

export interface Witness {
  total_missed: number;
  url: string;
  props: {
    account_creation_fee: string;
    account_subsidy_budget: number;
    maximum_block_size: number;
  };
  hbd_exchange_rate: {
    base: string;
  };
  available_witness_account_subsidies: number;
  running_version: string;
  owner: string;
  signing_key: string;
  last_hbd_exchange_update: string;
}

export const getWitnessesByVote = (from: string, limit: number): Promise<Witness[]> =>
  client.call("condenser_api", "get_witnesses_by_vote", [from, limit]);

export interface Proposal {
  creator: string;
  daily_pay: {
    amount: string;
    nai: string;
    precision: number;
  };
  end_date: string;
  id: number;
  permlink: string;
  proposal_id: number;
  receiver: string;
  start_date: string;
  status: string;
  subject: string;
  total_votes: string;
}

export const getProposals = (): Promise<Proposal[]> =>
  client
    .call("database_api", "list_proposals", {
      start: [-1],
      limit: 200,
      order: "by_total_votes",
      order_direction: "descending",
      status: "all"
    })
    .then((r) => r.proposals);

export interface ProposalVote {
  id: number;
  proposal: Proposal;
  voter: string;
}

export const getProposalVotes = (
  proposalId: number,
  voter: string,
  limit: number
): Promise<ProposalVote[]> =>
  client
    .call("condenser_api", "list_proposal_votes", [[proposalId, voter], limit, "by_proposal_voter"])
    .then((r) => r.filter((x: ProposalVote) => x.proposal.proposal_id === proposalId))
    .then((r) => r.map((x: ProposalVote) => ({ id: x.id, voter: x.voter })));

export interface WithdrawRoute {
  auto_vest: boolean;
  from_account: string;
  id: number;
  percent: number;
  to_account: string;
}

export const getWithdrawRoutes = (account: string): Promise<WithdrawRoute[]> =>
  client.database.call("get_withdraw_routes", [account, "outgoing"]);

export const votingPower = (account: FullAccount): number => {
  // @ts-ignore "Account" is compatible with dhive's "ExtendedAccount"
  const calc = account && client.rc.calculateVPMana(account);
  const { percentage } = calc;

  return percentage / 100;
};

export const powerRechargeTime = (power: number) => {
  const missingPower = 100 - power;
  return (missingPower * 100 * 432000) / 10000;
};

export const votingValue = (
  account: FullAccount,
  dynamicProps: DynamicProps,
  votingPower: number,
  weight: number = 10000
): number => {
  const { fundRecentClaims, fundRewardBalance, base, quote } = dynamicProps;

  const total_vests =
    parseAsset(account.vesting_shares).amount +
    parseAsset(account.received_vesting_shares).amount -
    parseAsset(account.delegated_vesting_shares).amount;

  const rShares = vestsToRshares(total_vests, votingPower, weight);

  return (rShares / fundRecentClaims) * fundRewardBalance * (base / quote);
};

const HIVE_VOTING_MANA_REGENERATION_SECONDS = 5 * 60 * 60 * 24; //5 days

export const downVotingPower = (account: FullAccount): number => {
  const totalShares =
    parseFloat(account.vesting_shares) +
    parseFloat(account.received_vesting_shares) -
    parseFloat(account.delegated_vesting_shares) -
    parseFloat(account.vesting_withdraw_rate);
  const elapsed = Math.floor(Date.now() / 1000) - account.downvote_manabar.last_update_time;
  const maxMana = (totalShares * 1000000) / 4;

  let currentMana =
    parseFloat(account.downvote_manabar.current_mana.toString()) +
    (elapsed * maxMana) / HIVE_VOTING_MANA_REGENERATION_SECONDS;

  if (currentMana > maxMana) {
    currentMana = maxMana;
  }
  const currentManaPerc = (currentMana * 100) / maxMana;

  if (isNaN(currentManaPerc)) {
    return 0;
  }

  if (currentManaPerc > 100) {
    return 100;
  }
  return currentManaPerc;
};

export const rcPower = (account: RCAccount): number => {
  const calc = client.rc.calculateRCMana(account);
  const { percentage } = calc;
  return percentage / 100;
};

export interface ConversionRequest {
  amount: string;
  conversion_date: string;
  id: number;
  owner: string;
  requestid: number;
}

export interface CollateralizedConversionRequest {
  collateral_amount: string;
  conversion_date: string;
  converted_amount: string;
  id: number;
  owner: string;
  requestid: number;
}

export const getConversionRequests = (account: string): Promise<ConversionRequest[]> =>
  client.database.call("get_conversion_requests", [account]);

export const getCollateralizedConversionRequests = (
  account: string
): Promise<CollateralizedConversionRequest[]> =>
  client.database.call("get_collateralized_conversion_requests", [account]);

export interface SavingsWithdrawRequest {
  id: number;
  from: string;
  to: string;
  memo: string;
  request_id: number;
  amount: string;
  complete: string;
}

export const getSavingsWithdrawFrom = (account: string): Promise<SavingsWithdrawRequest[]> =>
  client.database.call("get_savings_withdraw_from", [account]);

export interface BlogEntry {
  blog: string;
  entry_id: number;
  post_id?: number;
  num?: number;
  author: string;
  permlink: string;
  reblogged_on: string;
  created?: string;
}

export const getBlogEntries = (username: string, limit: number = dataLimit): Promise<BlogEntry[]> =>
  client.call("condenser_api", "get_blog_entries", [username, 0, limit]);

export const findAccountRecoveryRequest = (account: string): Promise<any> =>
  client.call("database_api", "find_change_recovery_account_requests", { accounts: [account] });

// @source https://ecency.com/hive-139531/@andablackwidow/rc-stats-in-1-27
export type RcOperation =
  | "comment_operation"
  | "vote_operation"
  | "transfer_operation"
  | "custom_json_operation";

export interface RcOperationStats {
  count: number; // number of such operations executed during last day
  avg_cost_rc: number; // average RC cost of single operation
  resource_cost: {
    // average RC cost split between various resources
    history_rc: number;
    tokens_rc: number;
    market_rc: number;
    state_rc: number;
    exec_rc: number;
  };
  resource_cost_share: {
    // share of resource cost in average final cost (expressed in basis points)
    history_bp: number;
    tokens_bp: number;
    market_bp: number;
    state_bp: number;
    exec_bp: number;
  };
  resource_usage: {
    // average consumption of resources per operation
    history_bytes: number; // - size of transaction in bytes
    tokens: string; // - number of tokens (always 0 or 1 (with exception of multiop) - tokens are internally expressed with 4 digit precision
    market_bytes: number; // - size of transaction in bytes when it belongs to market category or 0 otherwise
    state_hbytes: number; // - hour-bytes of state
    exec_ns: number; // - nanoseconds of execution time
  };
}

export const getRcOperationStats = (): Promise<any> => client.call("rc_api", "get_rc_stats", {});

export const getContentReplies = (author: string, permlink: string): Promise<Entry[] | null> =>
  client.call("condenser_api", "get_content_replies", { author, permlink });
