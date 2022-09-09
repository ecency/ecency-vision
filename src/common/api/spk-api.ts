import axios from 'axios';
import * as sdk from 'hivesigner';
import { PrivateKey, TransactionConfirmation } from '@hiveio/dhive';
import { client as hiveClient } from './hive';
import * as keychain from '../helper/keychain';
import parseAsset, { Symbol } from '../helper/parse-asset';

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

export const getSpkWallet = async (username: string): Promise<SpkApiWallet> => {
  const resp = await axios.get<SpkApiWallet>(`https://spkinstant.hivehoneycomb.com/@${username}`);
  return resp.data;
}

export const sendSpk = (from: string, to: string, amount: string, memo?: string) => {
  const params = {
    authority: 'active',
    required_auths: from,
    required_posting_auths: '[]',
    id: 'spkcc_spk_send',
    json: JSON.stringify({
      to,
      amount,
      ...(memo ? { memo } : {})
    })
  };
  const url = sdk.sign('custom_json', params, window.location.href);
  if (typeof url === 'string') {
    window.open(url, 'blank');
  }
}

export const transferSpkByKey = async (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    to,
    amount,
    ...(memo ? { memo } : {})
  });

  const op = {
    id: 'spkcc_spk_send',
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  return await hiveClient.broadcast.json(op, key);
};

export const transferSpkByKc = async (
  from: string,
  to: string,
  amount: string,
  memo: string
) => {
  const json = JSON.stringify({
    to,
    amount,
    ...(memo ? { memo } : {})
  });
  return keychain.customJson(from, 'spkcc_spk_send', 'Active', json, '', '');
}
