import axios from "axios";
import HiveEngineToken from "../helper/hive-engine-wallet";
import { TransactionConfirmation } from "@hiveio/dhive";
import { broadcastPostingJSON } from "./operations";
import engine from "../constants/engine.json";

interface TokenBalance {
  symbol: string;
  balance: string;
  stake: string;
  pendingUnstake: string;
  delegationsIn: string;
  delegationsOut: string;
  pendingUndelegations: string;
}

interface Token {
  issuer: string;
  symbol: string;
  name: string;
  metadata: string;
  precision: number;
  maxSupply: string;
  supply: string;
  circulatingSupply: string;
  stakingEnabled: boolean;
  unstakingCooldown: number;
  delegationEnabled: boolean;
  undelegationCooldown: number;
  numberTransactions: number;
  totalStaked: string;
}

interface TokenMetadata {
  desc: string;
  url: string;
  icon: string;
}

export interface TokenStatus {
  symbol: string;
  pending_token: number;
  precision: number;
}

export interface Unstake {
  _id: number;
  account: string;
  symbol: string;
  quantity: string;
  quantityLeft: string;
  nextTransactionTimestamp: number;
  numberTransactionsLeft: string;
  millisecPerPeriod: string;
  txID: string;
}

import { HECoarseTransaction, HEFineTransaction } from "../store/transactions/types";

const HIVE_ENGINE_RPC_URL = engine.engineRpcUrl;

export const getPendingUnstakes = (account: string, tokenName: string): Promise<Array<Unstake>> => {
  const data = {
    jsonrpc: "2.0",
    method: "find",
    params: {
      contract: "tokens",
      table: "pendingUnstakes",
      query: {
        account: account,
        token: tokenName
      }
    },
    id: 1
  };

  return axios
    .post(HIVE_ENGINE_RPC_URL, data, {
      headers: { "Content-type": "application/json" }
    })
    .then((r) => r.data.result)
    .catch((e) => {
      return [];
    });
};

export const getTokenBalances = (account: string): Promise<TokenBalance[]> => {
  const data = {
    jsonrpc: "2.0",
    method: "find",
    params: {
      contract: "tokens",
      table: "balances",
      query: {
        account: account
      }
    },
    id: 1
  };

  return axios
    .post(HIVE_ENGINE_RPC_URL, data, {
      headers: { "Content-type": "application/json" }
    })
    .then((r) => r.data.result)
    .catch((e) => {
      return [];
    });
};

const getTokens = (tokens: string[]): Promise<Token[]> => {
  const data = {
    jsonrpc: "2.0",
    method: "find",
    params: {
      contract: "tokens",
      table: "tokens",
      query: {
        symbol: { $in: tokens }
      }
    },
    id: 2
  };

  return axios
    .post(HIVE_ENGINE_RPC_URL, data, {
      headers: { "Content-type": "application/json" }
    })
    .then((r) => r.data.result)
    .catch((e) => {
      return [];
    });
};

export const getHiveEngineTokenBalance = async (
  account: string,
  tokenName: string
): Promise<HiveEngineToken> => {
  // commented just to try removing the non-existing unknowing HiveEngineTokenBalance type
  // ): Promise<HiveEngineTokenBalance[]> => {
  let balances = await getTokenBalances(account);
  const tokens = await getTokens([tokenName]);

  const balance = balances.find((balance) => balance.symbol == tokenName);
  const token = tokens[0];
  const tokenMetadata = token && (JSON.parse(token!.metadata) as TokenMetadata);

  return new HiveEngineToken({ ...balance, ...token, ...tokenMetadata } as any);
};

export const getHiveEngineTokenBalances = async (account: string): Promise<HiveEngineToken[]> => {
  // commented just to try removing the non-existing unknowing HiveEngineTokenBalance type
  // ): Promise<HiveEngineTokenBalance[]> => {
  const balances = await getTokenBalances(account);
  const tokens = await getTokens(balances.map((t) => t.symbol));

  return balances.map((balance) => {
    const token = tokens.find((t) => t.symbol == balance.symbol);
    const tokenMetadata = token && (JSON.parse(token!.metadata) as TokenMetadata);

    return new HiveEngineToken({ ...balance, ...token, ...tokenMetadata } as any);
  });
};

export const getUnclaimedRewards = async (account: string): Promise<TokenStatus[]> => {
  const rewardsUrl = engine.engineRewardsUrl;
  return (
    axios
      .get(`${rewardsUrl}/@${account}?hive=1`)
      .then((r) => r.data)
      .then((r) => Object.values(r))
      .then((r) => r.filter((t) => (t as TokenStatus).pending_token > 0)) as any
  ).catch(() => {
    return [];
  });
};

export const claimRewards = async (
  account: string,
  tokens: string[]
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify(
    tokens.map((r) => {
      return { symbol: r };
    })
  );

  return broadcastPostingJSON(account, "scot_claim_token", json);
};

export const stakeTokens = async (
  account: string,
  token: string,
  amount: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "stake",
    contractPayload: {
      symbol: token,
      to: account,
      quantity: amount
    }
  });

  return broadcastPostingJSON(account, "ssc-mainnet-hive", json);
};

export interface DelegationEntry {
  _id: number;
  from: string;
  to: string;
  symbol: string;
  quantity: string;
}

export async function getTokenDelegations(account: string): Promise<Array<DelegationEntry>> {
  const data = {
    jsonrpc: "2.0",
    method: "find",
    params: {
      contract: "tokens",
      table: "delegations",
      query: {
        $or: [{ from: account }, { to: account }]
      }
    },
    id: 3
  };
  return axios
    .post(HIVE_ENGINE_RPC_URL, data, {
      headers: { "Content-type": "application/json" }
    })
    .then((r) => {
      const list: Array<DelegationEntry> = r.data.result;
      return list;
    })
    .catch((e) => {
      console.log(e.message);
      return [];
    });
}

// Exclude author and curation reward details
export async function getCoarseTransactions(
  account: string,
  limit: number,
  symbol: string,
  offset: number = 0
) {
  const response = await axios({
    url: "https://accounts.hive-engine.com/accountHistory",
    method: "GET",
    params: {
      account,
      limit,
      offset,
      type: "user",
      symbol
    }
  });
  return response.data;
}

// Include virtual transactions like curation and author reward details.
export async function getFineTransactions(
  symbol: string,
  account: string,
  limit: number,
  offset: number
): Promise<Array<HEFineTransaction>> {
  return axios({
    url: `https://scot-api.hive-engine.com/get_account_history`,
    method: "GET",
    params: {
      account,
      token: symbol,
      limit,
      offset
    }
  }).then((response) => {
    return response.data;
  });
}

export const getMetrics: any = async (symbol?: any, account?: any) => {
  const data = {
    jsonrpc: "2.0",
    method: "find",
    params: {
      contract: "market",
      table: "metrics",
      query: {
        symbol: symbol,
        account: account
      }
    },
    id: 1
  };

  return axios
    .post(HIVE_ENGINE_RPC_URL, data, {
      headers: { "Content-type": "application/json" }
    })
    .then((r) => r.data.result)
    .catch((e) => {
      return [];
    });
};

export const getMarketData = async (symbol: any) => {
  const url: any = engine.chartApi;
  const { data: history } = await axios.get(`${url}`, {
    params: { symbol, interval: "daily" }
  });
  return history;
};

export interface ScotVoteShare {
  authorperm: "";
  block_num: number;
  percent: number;
  revoted: any;
  rshares: number;
  timestamp: string;
  token: string;
  voter: string;
  weight: number;
}

// See https://github.com/hive-engine/scotbot-docs/blob/master/docs/api/README.md for an example using
// https://scot-api.hive-engine.com/@${author}/${permlink}?hive=1.
export interface ScotRewardsInformation {
  [coin_id: string]: {
    active_votes: Array<{
      authorperm: string;
      block_num: number;
      percent: number;
      rshares: number;
      timestamp: string;
      token: string;
      voter: string;
      weight: number;
    }>;
    app: string;
    author: string;
    author_curve_exponent: number;
    authorperm: string;
    beneficiaries_payout_value: number;
    block: number;
    cashout_time: string;
    children: number;
    created: string;
    curator_payout_value: number;
    decline_payout: boolean;
    desc: string;
    json_metadata: string;
    last_payout: string;
    last_update: string;
    main_post: boolean;
    pending_token: number;
    precision: number;
    promoted: number;
    score_hot: number;
    score_trend: number;
    tags: string;
    title: string;
    token: string;
    total_payout_value: number;
    total_vote_weight: number;
    vote_rshares: number;
  };
}

export const getScotRewardsInformation = async (author: string, permlink: string) => {
  const info: any = await axios(`https://scot-api.hive-engine.com/@${author}/${permlink}?hive=1`, {
    method: "GET",
    params: {}
  });
  return info.data as ScotRewardsInformation;
};
