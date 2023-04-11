import hs from "hivesigner";

import {
  AccountUpdateOperation,
  CustomJsonOperation,
  Operation,
  PrivateKey,
  TransactionConfirmation
} from "@hiveio/dhive";

import { Parameters } from "hive-uri";

import { client as hiveClient } from "./hive";

import { Account } from "../store/accounts/types";

import { usrActivity } from "./private-api";

import { getAccessToken, getPostingKey } from "../helper/user-token";

import * as keychain from "../helper/keychain";

import parseAsset from "../helper/parse-asset";

import { hotSign } from "../helper/hive-signer";

import { _t } from "../i18n";
import { TransactionType } from "../components/buy-sell-hive";
import { ErrorTypes } from "../enums";
import { formatNumber } from "../helper/format-number";

export interface MetaData {
  image?: string[];
  image_ratios?: any;
  thumbnails?: string[];
  tags?: string[];
  app?: string;
  format?: string;
  community?: string;
  description?: string;
}

export interface BeneficiaryRoute {
  account: string;
  weight: number;
}

export interface CommentOptions {
  allow_curation_rewards: boolean;
  allow_votes: boolean;
  author: string;
  permlink: string;
  max_accepted_payout: string;
  percent_hbd: number;
  extensions: Array<[0, { beneficiaries: BeneficiaryRoute[] }]>;
}

export enum OrderIdPrefix {
  EMPTY = "",
  SWAP = "9"
}

export type RewardType = "default" | "sp" | "dp";

const handleChainError = (strErr: string): [string | null, ErrorTypes] => {
  if (/You may only post once every/.test(strErr)) {
    return [_t("chain-error.min-root-comment"), ErrorTypes.COMMON];
  } else if (/Your current vote on this comment is identical/.test(strErr)) {
    return [_t("chain-error.identical-vote"), ErrorTypes.INFO];
  } else if (/Please wait to transact, or power up/.test(strErr)) {
    return [_t("chain-error.insufficient-resource"), ErrorTypes.INSUFFICIENT_RESOURCE_CREDITS];
  } else if (/Cannot delete a comment with net positive/.test(strErr)) {
    return [_t("chain-error.delete-comment-with-vote"), ErrorTypes.INFO];
  } else if (/children == 0/.test(strErr)) {
    return [_t("chain-error.comment-children"), ErrorTypes.COMMON];
  } else if (/comment_cashout/.test(strErr)) {
    return [_t("chain-error.comment-cashout"), ErrorTypes.COMMON];
  } else if (/Votes evaluating for comment that is paid out is forbidden/.test(strErr)) {
    return [_t("chain-error.paid-out-post-forbidden"), ErrorTypes.COMMON];
  } else if (/Missing Active Authority/.test(strErr)) {
    return [_t("chain-error.missing-authority"), ErrorTypes.INFO];
  } else if (/Missing Owner Authority/.test(strErr)) {
    return [_t("chain-error.missing-owner-authority"), ErrorTypes.INFO];
  }

  return [null, ErrorTypes.COMMON];
};

export const formatError = (err: any): [string, ErrorTypes] => {
  let [chainErr, type] = handleChainError(err.toString());
  if (chainErr) {
    return [chainErr, type];
  }

  if (err.error_description && typeof err.error_description === "string") {
    let [chainErr, type] = handleChainError(err.error_description);
    if (chainErr) {
      return [chainErr, type];
    }

    return [err.error_description.substring(0, 80), ErrorTypes.COMMON];
  }

  if (err.message && typeof err.message === "string") {
    let [chainErr, type] = handleChainError(err.message);
    if (chainErr) {
      return [chainErr, type];
    }

    return [err.message.substring(0, 80), ErrorTypes.COMMON];
  }

  return ["", ErrorTypes.COMMON];
};

export const broadcastPostingJSON = (
  username: string,
  id: string,
  json: {}
): Promise<TransactionConfirmation> => {
  // With posting private key
  const postingKey = getPostingKey(username);
  if (postingKey) {
    const privateKey = PrivateKey.fromString(postingKey);

    const operation: CustomJsonOperation[1] = {
      id,
      required_auths: [],
      required_posting_auths: [username],
      json: JSON.stringify(json)
    };

    return hiveClient.broadcast.json(operation, privateKey);
  }

  // With hivesigner access token

  let token = getAccessToken(username);
  return token
    ? new hs.Client({
        accessToken: token
      })
        .customJson([], [username], id, JSON.stringify(json))
        .then((r: any) => r.result)
    : Promise.resolve(0);
};

const broadcastPostingOperations = (
  username: string,
  operations: Operation[]
): Promise<TransactionConfirmation> => {
  // With posting private key
  const postingKey = getPostingKey(username);
  if (postingKey) {
    const privateKey = PrivateKey.fromString(postingKey);

    return hiveClient.broadcast.sendOperations(operations, privateKey);
  }

  // With hivesigner access token
  let token = getAccessToken(username);
  return token
    ? new hs.Client({
        accessToken: token
      })
        .broadcast(operations)
        .then((r: any) => r.result)
    : Promise.resolve(0);
};

export const reblog = (
  username: string,
  author: string,
  permlink: string,
  _delete: boolean = false
): Promise<TransactionConfirmation> => {
  const message = {
    account: username,
    author,
    permlink
  };

  if (_delete) {
    message["delete"] = "delete";
  }

  const json = ["reblog", message];

  return broadcastPostingJSON(username, "follow", json).then((r: TransactionConfirmation) => {
    usrActivity(username, 130, r.block_num, r.id).then();
    return r;
  });
};

export const comment = (
  username: string,
  parentAuthor: string,
  parentPermlink: string,
  permlink: string,
  title: string,
  body: string,
  jsonMetadata: MetaData,
  options: CommentOptions | null,
  point: boolean = false
): Promise<TransactionConfirmation> => {
  const params = {
    parent_author: parentAuthor,
    parent_permlink: parentPermlink,
    author: username,
    permlink,
    title,
    body,
    json_metadata: JSON.stringify(jsonMetadata)
  };

  const opArray: Operation[] = [["comment", params]];

  if (options) {
    const e: Operation = ["comment_options", options];
    opArray.push(e);
  }

  return broadcastPostingOperations(username, opArray).then((r) => {
    if (point) {
      const t = title ? 100 : 110;
      usrActivity(username, t, r.block_num, r.id).then();
    }
    return r;
  });
};

export const deleteComment = (
  username: string,
  author: string,
  permlink: string
): Promise<TransactionConfirmation> => {
  const params = {
    author,
    permlink
  };

  const opArray: Operation[] = [["delete_comment", params]];

  return broadcastPostingOperations(username, opArray);
};

export const vote = (
  username: string,
  author: string,
  permlink: string,
  weight: number
): Promise<TransactionConfirmation> => {
  const params = {
    voter: username,
    author,
    permlink,
    weight
  };

  const opArray: Operation[] = [["vote", params]];

  return broadcastPostingOperations(username, opArray).then((r: TransactionConfirmation) => {
    usrActivity(username, 120, r.block_num, r.id).then();
    return r;
  });
};

export const changeRecoveryAccount = (
  account_to_recover: string,
  new_recovery_account: string,
  extensions: [],
  key: PrivateKey
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "change_recovery_account",
    {
      account_to_recover,
      new_recovery_account,
      extensions
    }
  ];
  return hiveClient.broadcast.sendOperations([op], key);
};

export const changeRecoveryAccountHot = (
  account_to_recover: string,
  new_recovery_account: string,
  extensions: []
) => {
  const op: Operation = [
    "change_recovery_account",
    {
      account_to_recover,
      new_recovery_account,
      extensions
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${account_to_recover}/permissions` };
  return hs.sendOperation(op, params, () => {});
};

export const changeRecoveryAccountKc = (
  account_to_recover: string,
  new_recovery_account: string,
  extensions: []
) => {
  const op: Operation = [
    "change_recovery_account",
    {
      account_to_recover,
      new_recovery_account,
      extensions
    }
  ];

  return keychain.broadcast(account_to_recover, [op], "Owner");
};

export const follow = (follower: string, following: string): Promise<TransactionConfirmation> => {
  const json = [
    "follow",
    {
      follower,
      following,
      what: ["blog"]
    }
  ];

  return broadcastPostingJSON(follower, "follow", json);
};

export const unFollow = (follower: string, following: string): Promise<TransactionConfirmation> => {
  const json = [
    "follow",
    {
      follower,
      following,
      what: []
    }
  ];

  return broadcastPostingJSON(follower, "follow", json);
};

export const ignore = (follower: string, following: string): Promise<TransactionConfirmation> => {
  const json = [
    "follow",
    {
      follower,
      following,
      what: ["ignore"]
    }
  ];

  return broadcastPostingJSON(follower, "follow", json);
};

export const claimRewardBalance = (
  username: string,
  rewardHive: string,
  rewardHbd: string,
  rewardVests: string
): Promise<TransactionConfirmation> => {
  const params = {
    account: username,
    reward_hive: rewardHive,
    reward_hbd: rewardHbd,
    reward_vests: rewardVests
  };

  const opArray: Operation[] = [["claim_reward_balance", params]];

  return broadcastPostingOperations(username, opArray);
};

export const transfer = (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  const args = {
    from,
    to,
    amount,
    memo
  };

  return hiveClient.broadcast.transfer(args, key);
};

export const transferHot = (from: string, to: string, amount: string, memo: string) => {
  const op: Operation = [
    "transfer",
    {
      from,
      to,
      amount,
      memo
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${from}/wallet` };
  return hs.sendOperation(op, params, () => {});
};

export const transferKc = (from: string, to: string, amount: string, memo: string) => {
  const asset = parseAsset(amount);
  return keychain.transfer(from, to, asset.amount.toFixed(3).toString(), memo, asset.symbol, true);
};

export const transferPoint = (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    sender: from,
    receiver: to,
    amount,
    memo
  });

  const op = {
    id: "ecency_point_transfer",
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  return hiveClient.broadcast.json(op, key);
};

export const transferPointHot = (from: string, to: string, amount: string, memo: string) => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: "ecency_point_transfer",
    json: JSON.stringify({
      sender: from,
      receiver: to,
      amount,
      memo
    })
  };

  hotSign("custom-json", params, `@${from}/points`);
};

export const transferPointKc = (from: string, to: string, amount: string, memo: string) => {
  const json = JSON.stringify({
    sender: from,
    receiver: to,
    amount,
    memo
  });

  return keychain.customJson(from, "ecency_point_transfer", "Active", json, "Point Transfer");
};

export const transferToSavings = (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "transfer_to_savings",
    {
      from,
      to,
      amount,
      memo
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const transferToSavingsHot = (from: string, to: string, amount: string, memo: string) => {
  const op: Operation = [
    "transfer_to_savings",
    {
      from,
      to,
      amount,
      memo
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${from}/wallet` };
  return hs.sendOperation(op, params, () => {});
};

export const transferToSavingsKc = (from: string, to: string, amount: string, memo: string) => {
  const op: Operation = [
    "transfer_to_savings",
    {
      from,
      to,
      amount,
      memo
    }
  ];

  return keychain.broadcast(from, [op], "Active");
};

export const limitOrderCreate = (
  owner: string,
  key: PrivateKey,
  amount_to_sell: any,
  min_to_receive: any,
  orderType: TransactionType,
  idPrefix = OrderIdPrefix.EMPTY
): Promise<TransactionConfirmation> => {
  let expiration: any = new Date(Date.now());
  expiration.setDate(expiration.getDate() + 27);
  expiration = expiration.toISOString().split(".")[0];

  const op: Operation = [
    "limit_order_create",
    {
      orderid: Number(
        `${idPrefix}${Math.floor(Date.now() / 1000)
          .toString()
          .slice(2)}`
      ),
      owner: owner,
      amount_to_sell: `${
        orderType === TransactionType.Buy
          ? formatNumber(amount_to_sell, 3)
          : formatNumber(min_to_receive, 3)
      } ${orderType === TransactionType.Buy ? "HBD" : "HIVE"}`,
      min_to_receive: `${
        orderType === TransactionType.Buy
          ? formatNumber(min_to_receive, 3)
          : formatNumber(amount_to_sell, 3)
      } ${orderType === TransactionType.Buy ? "HIVE" : "HBD"}`,
      fill_or_kill: false,
      expiration: expiration
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const limitOrderCancel = (
  owner: string,
  key: PrivateKey,
  orderid: number
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "limit_order_cancel",
    {
      owner: owner,
      orderid: orderid
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const limitOrderCreateHot = (
  owner: string,
  amount_to_sell: any,
  min_to_receive: any,
  orderType: TransactionType,
  idPrefix = OrderIdPrefix.EMPTY
) => {
  let expiration: any = new Date();
  expiration.setDate(expiration.getDate() + 27);
  expiration = expiration.toISOString().split(".")[0];
  const op: Operation = [
    "limit_order_create",
    {
      orderid: Number(
        `${idPrefix}${Math.floor(Date.now() / 1000)
          .toString()
          .slice(2)}`
      ),
      owner: owner,
      amount_to_sell: `${
        orderType === TransactionType.Buy
          ? formatNumber(amount_to_sell, 3)
          : formatNumber(min_to_receive, 3)
      } ${orderType === TransactionType.Buy ? "HBD" : "HIVE"}`,
      min_to_receive: `${
        orderType === TransactionType.Buy
          ? formatNumber(min_to_receive, 3)
          : formatNumber(amount_to_sell, 3)
      } ${orderType === TransactionType.Buy ? "HIVE" : "HBD"}`,
      fill_or_kill: false,
      expiration: expiration
    }
  ];

  const params: Parameters = {
    callback: `https://ecency.com/market${idPrefix === OrderIdPrefix.SWAP ? "#swap" : ""}`
  };
  return hs.sendOperation(op, params, () => {});
};

export const limitOrderCancelHot = (owner: string, orderid: number) => {
  const op: Operation = [
    "limit_order_cancel",
    {
      orderid: orderid,
      owner: owner
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/market` };
  return hs.sendOperation(op, params, () => {});
};

export const limitOrderCreateKc = (
  owner: string,
  amount_to_sell: any,
  min_to_receive: any,
  orderType: TransactionType,
  idPrefix: OrderIdPrefix = OrderIdPrefix.EMPTY
) => {
  let expiration: any = new Date();
  expiration.setDate(expiration.getDate() + 27);
  expiration = expiration.toISOString().split(".")[0];
  const op: Operation = [
    "limit_order_create",
    {
      orderid: Number(
        `${idPrefix}${Math.floor(Date.now() / 1000)
          .toString()
          .slice(2)}`
      ),
      owner: owner,
      amount_to_sell: `${
        orderType === TransactionType.Buy
          ? formatNumber(amount_to_sell, 3)
          : formatNumber(min_to_receive, 3)
      } ${orderType === TransactionType.Buy ? "HBD" : "HIVE"}`,
      min_to_receive: `${
        orderType === TransactionType.Buy
          ? formatNumber(min_to_receive, 3)
          : formatNumber(amount_to_sell, 3)
      } ${orderType === TransactionType.Buy ? "HIVE" : "HBD"}`,
      fill_or_kill: false,
      expiration: expiration
    }
  ];

  return keychain.broadcast(owner, [op], "Active");
};

export const limitOrderCancelKc = (owner: string, orderid: any) => {
  const op: Operation = [
    "limit_order_cancel",
    {
      orderid: orderid,
      owner: owner
    }
  ];

  return keychain.broadcast(owner, [op], "Active");
};

export const convert = (
  owner: string,
  key: PrivateKey,
  amount: string
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "convert",
    {
      owner,
      amount,
      requestid: new Date().getTime() >>> 0
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const convertHot = (owner: string, amount: string) => {
  const op: Operation = [
    "convert",
    {
      owner,
      amount,
      requestid: new Date().getTime() >>> 0
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${owner}/wallet` };
  return hs.sendOperation(op, params, () => {});
};

export const convertKc = (owner: string, amount: string) => {
  const op: Operation = [
    "convert",
    {
      owner,
      amount,
      requestid: new Date().getTime() >>> 0
    }
  ];

  return keychain.broadcast(owner, [op], "Active");
};

export const transferFromSavings = (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "transfer_from_savings",
    {
      from,
      to,
      amount,
      memo,
      request_id: new Date().getTime() >>> 0
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const transferFromSavingsHot = (from: string, to: string, amount: string, memo: string) => {
  const op: Operation = [
    "transfer_from_savings",
    {
      from,
      to,
      amount,
      memo,
      request_id: new Date().getTime() >>> 0
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${from}/wallet` };
  return hs.sendOperation(op, params, () => {});
};

export const transferFromSavingsKc = (from: string, to: string, amount: string, memo: string) => {
  const op: Operation = [
    "transfer_from_savings",
    {
      from,
      to,
      amount,
      memo,
      request_id: new Date().getTime() >>> 0
    }
  ];

  return keychain.broadcast(from, [op], "Active");
};

export const claimInterest = (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  const rid = new Date().getTime() >>> 0;
  const op: Operation = [
    "transfer_from_savings",
    {
      from,
      to,
      amount,
      memo,
      request_id: rid
    }
  ];
  const cop: Operation = [
    "cancel_transfer_from_savings",
    {
      from,
      request_id: rid
    }
  ];

  return hiveClient.broadcast.sendOperations([op, cop], key);
};

export const claimInterestHot = (from: string, to: string, amount: string, memo: string) => {
  const rid = new Date().getTime() >>> 0;
  const op: Operation = [
    "transfer_from_savings",
    {
      from,
      to,
      amount,
      memo,
      request_id: rid
    }
  ];
  const cop: Operation = [
    "cancel_transfer_from_savings",
    {
      from,
      request_id: rid
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${from}/wallet` };
  return hs.sendOperations([op, cop], params, () => {});
};

export const claimInterestKc = (from: string, to: string, amount: string, memo: string) => {
  const rid = new Date().getTime() >>> 0;
  const op: Operation = [
    "transfer_from_savings",
    {
      from,
      to,
      amount,
      memo,
      request_id: rid
    }
  ];
  const cop: Operation = [
    "cancel_transfer_from_savings",
    {
      from,
      request_id: rid
    }
  ];

  return keychain.broadcast(from, [op, cop], "Active");
};

export const transferToVesting = (
  from: string,
  key: PrivateKey,
  to: string,
  amount: string
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "transfer_to_vesting",
    {
      from,
      to,
      amount
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const transferToVestingHot = (from: string, to: string, amount: string) => {
  const op: Operation = [
    "transfer_to_vesting",
    {
      from,
      to,
      amount
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${from}/wallet` };
  return hs.sendOperation(op, params, () => {});
};

export const transferToVestingKc = (from: string, to: string, amount: string) => {
  const op: Operation = [
    "transfer_to_vesting",
    {
      from,
      to,
      amount
    }
  ];

  return keychain.broadcast(from, [op], "Active");
};

export const delegateVestingShares = (
  delegator: string,
  key: PrivateKey,
  delegatee: string,
  vestingShares: string
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "delegate_vesting_shares",
    {
      delegator,
      delegatee,
      vesting_shares: vestingShares
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const delegateVestingSharesHot = (
  delegator: string,
  delegatee: string,
  vestingShares: string
) => {
  const op: Operation = [
    "delegate_vesting_shares",
    {
      delegator,
      delegatee,
      vesting_shares: vestingShares
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${delegator}/wallet` };
  return hs.sendOperation(op, params, () => {});
};

export const delegateVestingSharesKc = (
  delegator: string,
  delegatee: string,
  vestingShares: string
) => {
  const op: Operation = [
    "delegate_vesting_shares",
    {
      delegator,
      delegatee,
      vesting_shares: vestingShares
    }
  ];

  return keychain.broadcast(delegator, [op], "Active");
};

export const delegateRC = (
  delegator: string,
  delegatees: string,
  max_rc: string | number
): Promise<TransactionConfirmation> => {
  const json = [
    "delegate_rc",
    {
      from: delegator,
      delegatees: [delegatees],
      max_rc: max_rc
    }
  ];

  return broadcastPostingJSON(delegator, "rc", json);
};

export const withdrawVesting = (
  account: string,
  key: PrivateKey,
  vestingShares: string
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "withdraw_vesting",
    {
      account,
      vesting_shares: vestingShares
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const withdrawVestingHot = (account: string, vestingShares: string) => {
  const op: Operation = [
    "withdraw_vesting",
    {
      account,
      vesting_shares: vestingShares
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${account}/wallet` };
  return hs.sendOperation(op, params, () => {});
};

export const withdrawVestingKc = (account: string, vestingShares: string) => {
  const op: Operation = [
    "withdraw_vesting",
    {
      account,
      vesting_shares: vestingShares
    }
  ];

  return keychain.broadcast(account, [op], "Active");
};

export const setWithdrawVestingRoute = (
  from: string,
  key: PrivateKey,
  to: string,
  percent: number,
  autoVest: boolean
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "set_withdraw_vesting_route",
    {
      from_account: from,
      to_account: to,
      percent,
      auto_vest: autoVest
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const setWithdrawVestingRouteHot = (
  from: string,
  to: string,
  percent: number,
  autoVest: boolean
) => {
  const op: Operation = [
    "set_withdraw_vesting_route",
    {
      from_account: from,
      to_account: to,
      percent,
      auto_vest: autoVest
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${from}/wallet` };
  return hs.sendOperation(op, params, () => {});
};

export const setWithdrawVestingRouteKc = (
  from: string,
  to: string,
  percent: number,
  autoVest: boolean
) => {
  const op: Operation = [
    "set_withdraw_vesting_route",
    {
      from_account: from,
      to_account: to,
      percent,
      auto_vest: autoVest
    }
  ];

  return keychain.broadcast(from, [op], "Active");
};

export const witnessVote = (
  account: string,
  key: PrivateKey,
  witness: string,
  approve: boolean
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "account_witness_vote",
    {
      account,
      witness,
      approve
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const witnessVoteHot = (account: string, witness: string, approve: boolean) => {
  const params = {
    account,
    witness,
    approve
  };

  hotSign("account-witness-vote", params, "witnesses");
};

export const witnessVoteKc = (account: string, witness: string, approve: boolean) => {
  return keychain.witnessVote(account, witness, approve);
};

export const witnessProxy = (
  account: string,
  key: PrivateKey,
  proxy: string
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "account_witness_proxy",
    {
      account,
      proxy
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const witnessProxyHot = (account: string, proxy: string) => {
  const params = {
    account,
    proxy
  };

  hotSign("account-witness-proxy", params, "witnesses");
};

export const witnessProxyKc = (account: string, witness: string) => {
  return keychain.witnessProxy(account, witness);
};

export const proposalVote = (
  account: string,
  key: PrivateKey,
  proposal: number,
  approve: boolean
): Promise<TransactionConfirmation> => {
  const op: Operation = [
    "update_proposal_votes",
    {
      voter: account,
      proposal_ids: [proposal],
      approve,
      extensions: []
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const proposalVoteHot = (account: string, proposal: number, approve: boolean) => {
  const params = {
    account,
    proposal_ids: JSON.stringify([proposal]),
    approve
  };

  hotSign("update-proposal-votes", params, "proposals");
};

export const proposalVoteKc = (account: string, proposal: number, approve: boolean) => {
  const op: Operation = [
    "update_proposal_votes",
    {
      voter: account,
      proposal_ids: [proposal],
      approve,
      extensions: []
    }
  ];

  return keychain.broadcast(account, [op], "Active");
};

export const subscribe = (
  username: string,
  community: string
): Promise<TransactionConfirmation> => {
  const json = ["subscribe", { community }];

  return broadcastPostingJSON(username, "community", json);
};

export const unSubscribe = (
  username: string,
  community: string
): Promise<TransactionConfirmation> => {
  const json = ["unsubscribe", { community }];

  return broadcastPostingJSON(username, "community", json);
};

export const promote = (
  key: PrivateKey,
  user: string,
  author: string,
  permlink: string,
  duration: number
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    user,
    author,
    permlink,
    duration
  });

  const op = {
    id: "ecency_promote",
    json,
    required_auths: [user],
    required_posting_auths: []
  };

  return hiveClient.broadcast.json(op, key);
};

export const promoteHot = (user: string, author: string, permlink: string, duration: number) => {
  const params = {
    authority: "active",
    required_auths: `["${user}"]`,
    required_posting_auths: "[]",
    id: "ecency_promote",
    json: JSON.stringify({
      user,
      author,
      permlink,
      duration
    })
  };

  hotSign("custom-json", params, `@${user}/points`);
};

export const promoteKc = (user: string, author: string, permlink: string, duration: number) => {
  const json = JSON.stringify({
    user,
    author,
    permlink,
    duration
  });

  return keychain.customJson(user, "ecency_promote", "Active", json, "Promote");
};

export const boost = (
  key: PrivateKey,
  user: string,
  author: string,
  permlink: string,
  amount: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    user,
    author,
    permlink,
    amount
  });

  const op = {
    id: "ecency_boost",
    json,
    required_auths: [user],
    required_posting_auths: []
  };

  return hiveClient.broadcast.json(op, key);
};

export const boostHot = (user: string, author: string, permlink: string, amount: string) => {
  const params = {
    authority: "active",
    required_auths: `["${user}"]`,
    required_posting_auths: "[]",
    id: "ecency_boost",
    json: JSON.stringify({
      user,
      author,
      permlink,
      amount
    })
  };

  hotSign("custom-json", params, `@${user}/points`);
};

export const boostKc = (user: string, author: string, permlink: string, amount: string) => {
  const json = JSON.stringify({
    user,
    author,
    permlink,
    amount
  });

  return keychain.customJson(user, "ecency_boost", "Active", json, "Boost");
};

export const communityRewardsRegister = (
  key: PrivateKey,
  name: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    name
  });

  const op = {
    id: "ecency_registration",
    json,
    required_auths: [name],
    required_posting_auths: []
  };

  return hiveClient.broadcast.json(op, key);
};

export const communityRewardsRegisterHot = (name: string) => {
  const params = {
    authority: "active",
    required_auths: `["${name}"]`,
    required_posting_auths: "[]",
    id: "ecency_registration",
    json: JSON.stringify({
      name
    })
  };

  hotSign("custom-json", params, `created/${name}`);
};

export const communityRewardsRegisterKc = (name: string) => {
  const json = JSON.stringify({
    name
  });

  return keychain.customJson(name, "ecency_registration", "Active", json, "Community Registration");
};

export const updateProfile = (
  account: Account,
  newProfile: any
): Promise<TransactionConfirmation> => {
  const params = {
    account: account.name,
    json_metadata: "",
    posting_json_metadata: JSON.stringify({ profile: { ...newProfile, version: 2 } }),
    extensions: []
  };

  const opArray: Operation[] = [["account_update2", params]];

  return broadcastPostingOperations(account.name, opArray);
};

export const grantPostingPermission = (key: PrivateKey, account: Account, pAccount: string) => {
  if (!account.__loaded) {
    throw "posting|memo_key|json_metadata required with account instance";
  }

  const newPosting = Object.assign(
    {},
    { ...account.posting },
    {
      account_auths: [
        ...account.posting.account_auths,
        [pAccount, account.posting.weight_threshold]
      ]
    }
  );

  // important!
  newPosting.account_auths.sort((a, b) => (a[0] > b[0] ? 1 : -1));

  return hiveClient.broadcast.updateAccount(
    {
      account: account.name,
      posting: newPosting,
      active: undefined,
      memo_key: account.memo_key,
      json_metadata: account.json_metadata
    },
    key
  );
};

export const revokePostingPermission = (key: PrivateKey, account: Account, pAccount: string) => {
  if (!account.__loaded) {
    throw "posting|memo_key|json_metadata required with account instance";
  }

  const newPosting = Object.assign(
    {},
    { ...account.posting },
    {
      account_auths: account.posting.account_auths.filter((x) => x[0] !== pAccount)
    }
  );

  return hiveClient.broadcast.updateAccount(
    {
      account: account.name,
      posting: newPosting,
      memo_key: account.memo_key,
      json_metadata: account.json_metadata
    },
    key
  );
};

export const setUserRole = (
  username: string,
  community: string,
  account: string,
  role: string
): Promise<TransactionConfirmation> => {
  const json = ["setRole", { community, account, role }];

  return broadcastPostingJSON(username, "community", json);
};

export const updateCommunity = (
  username: string,
  community: string,
  props: {
    title: string;
    about: string;
    lang: string;
    description: string;
    flag_text: string;
    is_nsfw: boolean;
  }
): Promise<TransactionConfirmation> => {
  const json = ["updateProps", { community, props }];

  return broadcastPostingJSON(username, "community", json);
};

export const pinPost = (
  username: string,
  community: string,
  account: string,
  permlink: string,
  pin: boolean
): Promise<TransactionConfirmation> => {
  const json = [pin ? "pinPost" : "unpinPost", { community, account, permlink }];

  return broadcastPostingJSON(username, "community", json);
};

export const mutePost = (
  username: string,
  community: string,
  account: string,
  permlink: string,
  notes: string,
  mute: boolean
): Promise<TransactionConfirmation> => {
  const json = [mute ? "mutePost" : "unmutePost", { community, account, permlink, notes }];

  return broadcastPostingJSON(username, "community", json);
};

export const hiveNotifySetLastRead = (username: string): Promise<TransactionConfirmation> => {
  const now = new Date().toISOString();
  const date = now.split(".")[0];

  const params = {
    id: "notify",
    required_auths: [],
    required_posting_auths: [username],
    json: JSON.stringify(["setLastRead", { date }])
  };
  const params1 = {
    id: "ecency_notify",
    required_auths: [],
    required_posting_auths: [username],
    json: JSON.stringify(["setLastRead", { date }])
  };

  const opArray: Operation[] = [
    ["custom_json", params],
    ["custom_json", params1]
  ];

  return broadcastPostingOperations(username, opArray);
};

export const updatePassword = (
  update: AccountUpdateOperation[1],
  ownerKey: PrivateKey
): Promise<TransactionConfirmation> => hiveClient.broadcast.updateAccount(update, ownerKey);

// HE Operations
export const transferHiveEngineKc = (
  from: string,
  to: string,
  symbol: string,
  amount: string,
  memo: string
) => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "transfer",
    contractPayload: {
      symbol,
      to,
      quantity: amount.toString(),
      memo
    }
  });

  return keychain.customJson(from, "ssc-mainnet-hive", "Active", json, "Transfer");
};
export const delegateHiveEngineKc = (from: string, to: string, symbol: string, amount: string) => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "delegate",
    contractPayload: {
      symbol,
      to,
      quantity: amount.toString()
    }
  });

  return keychain.customJson(from, "ssc-mainnet-hive", "Active", json, "Transfer");
};
export const undelegateHiveEngineKc = (
  from: string,
  to: string,
  symbol: string,
  amount: string
) => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "undelegate",
    contractPayload: {
      symbol,
      from: to,
      quantity: amount.toString()
    }
  });

  return keychain.customJson(from, "ssc-mainnet-hive", "Active", json, "Transfer");
};
export const stakeHiveEngineKc = (from: string, to: string, symbol: string, amount: string) => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "stake",
    contractPayload: {
      symbol,
      to,
      quantity: amount.toString()
    }
  });

  return keychain.customJson(from, "ssc-mainnet-hive", "Active", json, "Transfer");
};
export const unstakeHiveEngineKc = (from: string, to: string, symbol: string, amount: string) => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "unstake",
    contractPayload: {
      symbol,
      to,
      quantity: amount.toString()
    }
  });

  return keychain.customJson(from, "ssc-mainnet-hive", "Active", json, "Transfer");
};

// HE Hive Signer Operations
export const transferHiveEngineHs = (
  from: string,
  to: string,
  symbol: string,
  amount: string,
  memo: string
): any => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: "ssc-mainnet-hive",
    json: JSON.stringify({
      contractName: "tokens",
      contractAction: "transfer",
      contractPayload: {
        symbol,
        to,
        quantity: amount.toString(),
        memo
      }
    })
  };

  return hotSign("custom-json", params, `@${from}/engine`);
};

export const delegateHiveEngineHs = (
  from: string,
  to: string,
  symbol: string,
  amount: string
): any => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: "ssc-mainnet-hive",
    json: JSON.stringify({
      contractName: "tokens",
      contractAction: "delegate",
      contractPayload: {
        symbol,
        to,
        quantity: amount.toString()
      }
    })
  };

  return hotSign("custom-json", params, `@${from}/engine`);
};

export const undelegateHiveEngineHs = (
  from: string,
  to: string,
  symbol: string,
  amount: string
): any => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: "ssc-mainnet-hive",
    json: JSON.stringify({
      contractName: "tokens",
      contractAction: "undelegate",
      contractPayload: {
        symbol,
        from: to,
        quantity: amount.toString()
      }
    })
  };

  return hotSign("custom-json", params, `@${from}/engine`);
};

export const stakeHiveEngineHs = (
  from: string,
  to: string,
  symbol: string,
  amount: string
): any => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: "ssc-mainnet-hive",
    json: JSON.stringify({
      contractName: "tokens",
      contractAction: "stake",
      contractPayload: {
        symbol,
        to,
        quantity: amount.toString()
      }
    })
  };

  return hotSign("custom-json", params, `@${from}/engine`);
};

export const unstakeHiveEngineHs = (
  from: string,
  to: string,
  symbol: string,
  amount: string
): any => {
  const params = {
    authority: "active",
    required_auths: `["${from}"]`,
    required_posting_auths: "[]",
    id: "ssc-mainnet-hive",
    json: JSON.stringify({
      contractName: "tokens",
      contractAction: "unstake",
      contractPayload: {
        symbol,
        to,
        quantity: amount.toString()
      }
    })
  };

  return hotSign("custom-json", params, `@${from}/engine`);
};

//HE Key Operations
export const transferHiveEngineKey = async (
  from: string,
  key: PrivateKey,
  symbol: string,
  to: string,
  amount: string,
  memo: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "transfer",
    contractPayload: {
      symbol,
      to,
      quantity: amount.toString(),
      memo
    }
  });

  const op = {
    id: "ssc-mainnet-hive",
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  const result = await hiveClient.broadcast.json(op, key);

  return result;
};

export const delegateHiveEngineKey = async (
  from: string,
  key: PrivateKey,
  symbol: string,
  to: string,
  amount: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "delegate",
    contractPayload: {
      symbol,
      to,
      quantity: amount.toString()
    }
  });

  const op = {
    id: "ssc-mainnet-hive",
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  const result = await hiveClient.broadcast.json(op, key);
  return result;
};

export const undelegateHiveEngineKey = async (
  from: string,
  key: PrivateKey,
  symbol: string,
  to: string,
  amount: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "undelegate",
    contractPayload: {
      symbol,
      from: to,
      quantity: amount.toString()
    }
  });

  const op = {
    id: "ssc-mainnet-hive",
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  const result = await hiveClient.broadcast.json(op, key);
  return result;
};

export const stakeHiveEngineKey = async (
  from: string,
  key: PrivateKey,
  symbol: string,
  to: string,
  amount: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "stake",
    contractPayload: {
      symbol,
      to,
      quantity: amount.toString()
    }
  });

  const op = {
    id: "ssc-mainnet-hive",
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  const result = await hiveClient.broadcast.json(op, key);
  return result;
};

export const unstakeHiveEngineKey = async (
  from: string,
  key: PrivateKey,
  symbol: string,
  to: string,
  amount: string
): Promise<TransactionConfirmation> => {
  const json = JSON.stringify({
    contractName: "tokens",
    contractAction: "stake",
    contractPayload: {
      symbol,
      to,
      quantity: amount.toString()
    }
  });

  const op = {
    id: "ssc-mainnet-hive",
    json,
    required_auths: [from],
    required_posting_auths: []
  };

  const result = await hiveClient.broadcast.json(op, key);
  return result;
};

export const Revoke = (
  account: string,
  weight_threshold: number,
  account_auths: [string, number][],
  key_auths: any[],
  memo_key: string,
  key: PrivateKey
): Promise<TransactionConfirmation> => {
  const newPosting = {
    weight_threshold,
    account_auths,
    key_auths
  };

  const op: Operation = [
    "account_update",
    {
      account,
      posting: newPosting,
      memo_key,
      json_metadata: ""
    }
  ];

  return hiveClient.broadcast.sendOperations([op], key);
};

export const RevokeHot = (
  account: string,
  weight_threshold: number,
  account_auths: [string, number][],
  key_auths: any[],
  memo_key: string
) => {
  const newPosting = {
    weight_threshold,
    account_auths,
    key_auths
  };

  const op: Operation = [
    "account_update",
    {
      account,
      posting: newPosting,
      memo_key,
      json_metadata: ""
    }
  ];

  const params: Parameters = { callback: `https://ecency.com/@${account}/permissions` };

  return hs.sendOperation(op, params, () => {});
};

export const RevokeKc = (
  account: string,
  weight_threshold: number,
  account_auths: [string, number][],
  key_auths: any[],
  memo_key: string
) => {
  const newPosting = {
    weight_threshold,
    account_auths,
    key_auths
  };

  const op: Operation = [
    "account_update",
    {
      account,
      posting: newPosting,
      memo_key,
      json_metadata: ""
    }
  ];

  return keychain.broadcast(account, [op], "Active");
};
