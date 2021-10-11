import axios from "axios";
import HiveEngineToken from "../helper/hive-engine-wallet";
import { PrivateKey, TransactionConfirmation } from "@hiveio/dhive";
import { client as hiveClient } from "./hive";
import { broadcastPostingJSON } from "./operations";
import { getAccessToken, getPostingKey } from "../helper/user-token";
import hs from "hivesigner";

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

const HIVE_ENGINE_RPC_URL = "https://api.hive-engine.com/rpc/contracts";

const getTokenBalances = (account: string): Promise<TokenBalance[]> => {
  const data = {
    jsonrpc: "2.0",
    method: "find",
    params: {
      contract: "tokens",
      table: "balances",
      query: {
        account: account,
      },
    },
    id: 1,
  };

  return axios
    .post(HIVE_ENGINE_RPC_URL, JSON.stringify(data), {
      headers: { "Content-type": "application/json" },
    })
    .then((r) => r.data.result);
};

const getTokens = (tokens: string[]): Promise<Token[]> => {
  const data = {
    jsonrpc: "2.0",
    method: "find",
    params: {
      contract: "tokens",
      table: "tokens",
      query: {
        symbol: { $in: tokens },
      },
    },
    id: 2,
  };

  return axios
    .post(HIVE_ENGINE_RPC_URL, JSON.stringify(data), {
      headers: { "Content-type": "application/json" },
    })
    .then((r) => r.data.result);
};

export const getHiveEngineTokenBalances = async (
  account: string
): Promise<HiveEngineTokenBalance[]> => {
  const balances = await getTokenBalances(account);
  const tokens = await getTokens(balances.map((t) => t.symbol));

  return balances.map((balance) => {
    const token = tokens.find((t) => t.symbol == balance.symbol);
    const tokenMetadata = JSON.parse(token.metadata) as TokenMetadata;

    return new HiveEngineToken({ ...balance, ...token, ...tokenMetadata });
  });
};

export const getUnclaimedRewards = async (
  account: string
): Promise<TokenStatus[]> => {
  return axios
    .get(`https://scot-api.hive-engine.com/@${account}?hive=1`)
    .then((r) => r.data)
    .then((r) => Object.values(r))
    .then((r) => r.filter((t) => t.pending_token > 0));
};

export const claimRewards = async (
  account: string,
  tokens: string[]
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify(tokens.map((r) => {
    return { symbol: r };
  }));

  return broadcastPostingJSON(account, "scot_claim_token", json);
};

export const stakeTokens = async (
  account: string,
  token: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "stake",
    contractPayload: {
      symbol: token,
      to: account,
      quantity: amount,
    },
  });

  return broadcastPostingJSON(account, "ssc-mainnet-hive", json);
};
