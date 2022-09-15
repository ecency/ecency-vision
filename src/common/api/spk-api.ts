import axios from "axios";
import * as sdk from "hivesigner";
import { PrivateKey, TransactionConfirmation } from "@hiveio/dhive";
import { client as hiveClient } from "./hive";
import * as keychain from "../helper/keychain";

const spkNode = "https://spk.good-karma.xyz";
const spkNodes = [
  "https://spk.good-karma.xyz",
  "https://spknode.blocktrades.us",
  "https://spk.tcmd-spkcc.com",
  "https://spktoken.dlux.io"
];

export interface SpkApiWallet {
  balance: number;
  claim: number;
  drop: {
    availible: {
      amount: number;
      precision: number;
      token: string;
    };
    last_claim: number;
    total_claims: number;
  };
  poweredUp: number;
  granted: {
    t: number;
    [key: string]: number;
  };
  granting: {
    t: number;
    [key: string]: number;
  };
  heldCollateral: number;
  contracts: unknown[];
  up: unknown;
  down: unknown;
  power_downs: { [key: string]: string };
  gov_downs: unknown;
  gov: number;
  spk: number;
  spk_block: number;
  tick: string; // double in string
  node: string;
  head_block: number;
  behind: number;
  VERSION: string; // v<x.x.x>
  pow: number;
}

export interface SpkMarkets {
  markets: {
    node: {
      [key: string]: {
        report: {
          block: number;
        };
      };
    };
  };
}

export interface Market {
  name: string;
  isAvailable: boolean;
}

export interface Markets {
  list: Market[];
  raw: any;
}

export interface HivePrice {
  hive: {
    usd: number;
  };
}

export function rewardSpk(data: SpkApiWallet, sstats: any) {
  let r = 0,
    a = 0,
    b = 0,
    c = 0,
    t = 0,
    diff = data.head_block - data.spk_block;
  if (!data.spk_block) {
    return 0;
  } else if (diff < 28800) {
    return 0;
  } else {
    t = diff / 28800;
    a = data.gov ? simpleInterest(data.gov, t, sstats.spk_rate_lgov) : 0;
    b = data.pow ? simpleInterest(data.pow, t, sstats.spk_rate_lpow) : 0;
    c = simpleInterest(
      (data.granted.t > 0 ? data.granted.t : 0) +
        (data.granting.t && data.granting.t > 0 ? data.granting.t : 0),
      t,
      sstats.spk_rate_ldel
    );
    const i = a + b + c;
    if (i) {
      return i;
    } else {
      return 0;
    }
  }
  function simpleInterest(p: number, t: number, r: number) {
    const amount = p * (1 + r / 365);
    const interest = amount - p;
    return interest * t;
  }
}

export const getSpkWallet = async (username: string): Promise<SpkApiWallet> => {
  const resp = await axios.get<SpkApiWallet>(`${spkNode}/@${username}`);
  return resp.data;
};

export const getMarkets = async (): Promise<Markets> => {
  const resp = await axios.get<SpkMarkets>(`${spkNode}/markets`);
  return {
    list: Object.entries(resp.data.markets.node).map(([name, value]) => ({
      name,
      isAvailable: value.report.block > 67819000
    })),
    raw: resp.data
  };
};

export const getHivePrice = async (): Promise<HivePrice> => {
  try {
    const resp = await axios.get<HivePrice>("https://api.coingecko.com/api/v3/simple/price", {
      params: {
        ids: "hive",
        vs_currencies: "usd"
      }
    });
    return resp.data;
  } catch (e) {
    return { hive: { usd: 0 } };
  }
};

const sendSpkGeneralByHs = (
  id: string,
  from: string,
  to: string,
  amount: string | number,
  memo?: string
) => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id,
    json: JSON.stringify({
      to,
      amount: +amount * 1000,
      ...(typeof memo === "string" ? { memo } : {})
    })
  };
  const url = sdk.sign("custom_json", params, window.location.href);
  if (typeof url === "string") {
    window.open(url, "blank");
  }
};

const transferSpkGeneralByKey = async (
  id: string,
  from: string,
  key: PrivateKey,
  to: string,
  amount: string | number,
  memo?: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    to,
    amount: +amount * 1000,
    ...(typeof memo === "string" ? { memo } : {})
  });

  const op = {
    id,
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  return await hiveClient.broadcast.json(op, key);
};

const transferSpkGeneralByKc = async (
  id: string,
  from: string,
  to: string,
  amount: string | number,
  memo?: string
) => {
  const json = JSON.stringify({
    to,
    amount: +amount * 1000,
    ...(typeof memo === "string" ? { memo } : {})
  });
  return keychain.customJson(from, id, "Active", json, "", "");
};

export const sendSpkByHs = (from: string, to: string, amount: string, memo?: string) => {
  return sendSpkGeneralByHs("spkcc_spk_send", from, to, amount, memo || "");
};

export const sendLarynxByHs = (from: string, to: string, amount: string, memo?: string) => {
  return sendSpkGeneralByHs("spkcc_send", from, to, amount, memo || "");
};

export const transferSpkByKey = async (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  return transferSpkGeneralByKey("spkcc_spk_send", from, key, to, amount, memo || "");
};

export const transferLarynxByKey = async (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  return transferSpkGeneralByKey("spkcc_send", from, key, to, amount, memo || "");
};

export const transferSpkByKc = async (from: string, to: string, amount: string, memo: string) => {
  return transferSpkGeneralByKc("spkcc_spk_send", from, to, amount, memo || "");
};

export const transferLarynxByKc = async (
  from: string,
  to: string,
  amount: string,
  memo: string
) => {
  return transferSpkGeneralByKc("spkcc_send", from, to, amount, memo || "");
};

export const delegateLarynxByKey = async (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string
) => {
  return transferSpkGeneralByKey("spkcc_power_grant", from, key, to, +amount * 1000);
};

export const delegateLarynxByHs = async (from: string, to: string, amount: string) => {
  return sendSpkGeneralByHs("spkcc_power_grant", from, to, +amount * 1000);
};

export const delegateLarynxByKc = async (from: string, to: string, amount: string) => {
  return transferSpkGeneralByKc("spkcc_power_grant", from, to, +amount * 1000);
};

export const claimAirdropLarynxByKey = async (from: string, key: PrivateKey) => {
  const json = JSON.stringify({ claim: true });

  const op = {
    id: "spkcc_claim",
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  return await hiveClient.broadcast.json(op, key);
};

export const claimAirdropLarynxByHs = (from: string) => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: "spkcc_claim",
    json: JSON.stringify({ claim: true })
  };
  const url = sdk.sign("custom_json", params, window.location.href);
  if (typeof url === "string") {
    window.open(url, "blank");
  }
};

export const claimAirdropLarynxByKc = async (from: string) => {
  const json = JSON.stringify({ claim: true });
  return keychain.customJson(from, "spkcc_claim", "Active", json, "", "");
};

export const claimLarynxByKey = async (from: string, key: PrivateKey) => {
  const json = JSON.stringify({ gov: false });

  const op = {
    id: "spkcc_shares_claim",
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  return await hiveClient.broadcast.json(op, key);
};

export const claimLarynxByHs = (from: string) => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: "spkcc_shares_claim",
    json: JSON.stringify({ gov: false })
  };
  const url = sdk.sign("custom_json", params, window.location.href);
  if (typeof url === "string") {
    window.open(url, "blank");
  }
};

export const claimLarynxByKc = async (from: string) => {
  const json = JSON.stringify({ gov: false });
  return keychain.customJson(from, "spkcc_shares_claim", "Active", json, "", "");
};

export const powerLarynxByKey = async (
  mode: "up" | "down",
  from: string,
  key: PrivateKey,
  amount: string
) => {
  const json = JSON.stringify({ amount: +amount * 1000 });

  const op = {
    id: `spkcc_power_${mode}`,
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  return await hiveClient.broadcast.json(op, key);
};

export const powerLarynxByHs = (mode: "up" | "down", from: string, amount: string) => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: `spkcc_power_${mode}`,
    json: JSON.stringify({ amount: +amount * 1000 })
  };
  const url = sdk.sign("custom_json", params, window.location.href);
  if (typeof url === "string") {
    window.open(url, "blank");
  }
};

export const powerLarynxByKc = async (mode: "up" | "down", from: string, amount: string) => {
  const json = JSON.stringify({ amount: +amount * 1000 });
  return keychain.customJson(from, `spkcc_power_${mode}`, "Active", json, "", "");
};

export const lockLarynxByKey = async (mode: "lock" | "unlock", key: PrivateKey, from: string, amount: string) => {
  const json = JSON.stringify({ amount: +amount * 1000 });

  const op = {
    id: mode === "lock" ? "spkcc_gov_up" : "spkcc_gov_down",
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  return await hiveClient.broadcast.json(op, key);
}

export const lockLarynxByHs = async (mode: "lock" | "unlock", from: string, amount: string) => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: mode === "lock" ? "spkcc_gov_up" : "spkcc_gov_down",
    json: JSON.stringify({ amount: +amount * 1000 })
  };
  const url = sdk.sign("custom_json", params, window.location.href);
  if (typeof url === "string") {
    window.open(url, "blank");
  }
}

export const lockLarynxByKc = async (mode: "lock" | "unlock", from: string, amount: string) => {
  const json = JSON.stringify({ amount: +amount * 1000 });
  return keychain.customJson(from, mode === "lock" ? "spkcc_gov_up" : "spkcc_gov_down", "Active", json, "", "");
}