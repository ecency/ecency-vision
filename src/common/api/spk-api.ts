import axios from 'axios';
import * as sdk from 'hivesigner';
import { PrivateKey, TransactionConfirmation } from '@hiveio/dhive';
import { client as hiveClient } from './hive';
import * as keychain from '../helper/keychain';

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
  },
  poweredUp: number;
  granted: unknown;
  granting: unknown;
  heldCollateral: number;
  contracts: unknown[];
  up: unknown;
  down: unknown;
  power_downs: unknown;
  gov_downs: unknown;
  gov: number;
  spk: number;
  spk_block: number;
  tick: string; // double in string
  node: string;
  head_block: number;
  behind: number;
  VERSION: string; // v<x.x.x>
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

export interface HivePrice {
  hive: {
    usd: number;
  };
}

export const getSpkWallet = async (username: string): Promise<SpkApiWallet> => {
  const resp = await axios.get<SpkApiWallet>(`https://spkinstant.hivehoneycomb.com/@${username}`);
  return resp.data;
}

export const getMarkets = async (): Promise<Market[]> => {
  const resp = await axios.get<SpkMarkets>('https://spkinstant.hivehoneycomb.com/markets');
  return Object.entries(resp.data.markets.node).map(([name, value]) => ({
    name,
    isAvailable: value.report.block > 67819000
  }));
}

export const getHivePrice = async (): Promise<HivePrice> => {
  try {
    const resp = await axios.get<HivePrice>('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'hive',
        vs_currencies: 'usd'
      }
    });
    return resp.data;
  } catch (e) {
    return { hive: { usd: 0 } }
  }
}

const sendSpkGeneralByHs = (id: string, from: string, to: string, amount: string | number, memo?: string) => {
  const params = {
    authority: 'active',
    required_auths: `["${from}"]`,
    required_posting_auths: '[]',
    id,
    json: JSON.stringify({
      to,
      amount: +amount * 1000,
      ...(typeof memo === 'string' ? { memo } : {})
    })
  };
  const url = sdk.sign('custom_json', params, window.location.href);
  if (typeof url === 'string') {
    window.open(url, 'blank');
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
    ...(typeof memo === 'string' ? { memo } : {})
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
    ...(typeof memo === 'string' ? { memo } : {})
  });
  return keychain.customJson(from, id, 'Active', json, '', '');
}


export const sendSpkByHs = (from: string, to: string, amount: string, memo?: string) => {
  return sendSpkGeneralByHs('spkcc_spk_send', from, to, amount, memo || '');
};

export const sendLarynxByHs = (from: string, to: string, amount: string, memo?: string) => {
  return sendSpkGeneralByHs('spkcc_send', from, to, amount, memo || '');
};

export const transferSpkByKey = async (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  return transferSpkGeneralByKey('spkcc_spk_send', from, key, to, amount, memo || '');
};

export const transferLarynxByKey = async (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  return transferSpkGeneralByKey('spkcc_send', from, key, to, amount, memo || '');
};

export const transferSpkByKc = async (
  from: string,
  to: string,
  amount: string,
  memo: string
) => {
  return transferSpkGeneralByKc('spkcc_spk_send', from , to, amount, memo || '');
};

export const transferLarynxByKc = async (
  from: string,
  to: string,
  amount: string,
  memo: string
) => {
  return transferSpkGeneralByKc('spkcc_send', from , to, amount, memo || '');
};

export const delegateLarynxByKey = async (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string
) => {
  return transferSpkGeneralByKey('spkcc_power_grant', from, key, to, +amount * 1000);
};

export const delegateLarynxByHs = async (from: string, to: string, amount: string) => {
  return sendSpkGeneralByHs('spkcc_power_grant', from, to, +amount * 1000);
};

export const delegateLarynxByKc = async (from: string, to: string, amount: string) => {
  return transferSpkGeneralByKc('spkcc_power_grant', from , to, +amount * 1000);
};