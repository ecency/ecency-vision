import axios from "axios";
import HiveEngineToken from "../helper/hive-engine-wallet";
import { TransactionConfirmation } from "@hiveio/dhive";
import { broadcastPostingJSON } from "./operations";
import engine from "../constants/engine.json";
import { apiBase } from "./helper";

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
    .post(apiBase(engine.API), data, {
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
    .post(apiBase(engine.API), data, {
      headers: { "Content-type": "application/json" }
    })
    .then((r) => r.data.result)
    .catch((e) => {
      return [];
    });
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
  return (
    axios
      .get(apiBase(`${engine.rewardAPI}/${account}?hive=1`))
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

  // const result = await axios
  //     .post(HIVE_ENGINE_RPC_URL, data, {
  //       headers: { "Content-type": "application/json" }
  //     })
  //     return result;
  return axios
    .post(apiBase(engine.API), data, {
      headers: { "Content-type": "application/json" }
    })
    .then((r) => r.data.result)
    .catch((e) => {
      return [];
    });
};

export const getMarketData = async (symbol: any) => {
  const { data: history } = await axios.get(apiBase(`${engine.chartAPI}`), {
    params: { symbol, interval: "daily" }
  });
  return history;
};
