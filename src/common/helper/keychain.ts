import { AppWindow } from "../../client/window";

import { Symbol } from "./parse-asset";

declare var window: AppWindow;

interface TxResponse {
  success: boolean;
  result: string;
}

type AuthorityTypes = "Owner" | "Active" | "Posting" | "Memo";

type Keys = { active: any; posting: any; memo: any };

export const handshake = (): Promise<void> =>
  new Promise<void>((resolve) => {
    window.hive_keychain?.requestHandshake(() => {
      resolve();
    });
  });

export const signBuffer = (
  account: string,
  message: string,
  authType: AuthorityTypes = "Active",
  rpc: string | null = null
): Promise<TxResponse> =>
  new Promise<TxResponse>((resolve, reject) => {
    window.hive_keychain?.requestSignBuffer(
      account,
      message,
      authType,
      (resp) => {
        if (!resp.success) {
          reject({ message: "Operation cancelled" });
        }

        resolve(resp);
      },
      rpc
    );
  });

export const addAccountAuthority = (
  account: string,
  authorizedUsername: string,
  role: AuthorityTypes = "Posting",
  weight: number,
  rpc: string | null = null
): Promise<TxResponse> =>
  new Promise<TxResponse>((resolve, reject) => {
    window.hive_keychain?.requestAddAccountAuthority(
      account,
      authorizedUsername,
      role,
      weight,
      (resp) => {
        if (!resp.success) {
          reject({ message: "Operation cancelled" });
        }

        resolve(resp);
      },
      rpc
    );
  });

export const removeAccountAuthority = (
  account: string,
  authorizedUsername: string,
  role: AuthorityTypes,
  rpc: string | null = null
): Promise<TxResponse> =>
  new Promise<TxResponse>((resolve, reject) => {
    window.hive_keychain?.requestRemoveAccountAuthority(
      account,
      authorizedUsername,
      "Posting",
      (resp) => {
        if (!resp.success) {
          reject({ message: "Operation cancelled" });
        }

        resolve(resp);
      },
      rpc
    );
  });

export const transfer = (
  account: string,
  to: string,
  amount: string,
  memo: string,
  currency: Symbol,
  enforce: boolean,
  rpc: string | null = null
): Promise<TxResponse> =>
  new Promise<TxResponse>((resolve, reject) => {
    window.hive_keychain?.requestTransfer(
      account,
      to,
      amount,
      memo,
      currency,
      (resp) => {
        if (!resp.success) {
          reject({ message: "Operation cancelled" });
        }

        resolve(resp);
      },
      enforce,
      rpc
    );
  });

export const customJson = (
  account: string,
  id: string,
  key: AuthorityTypes,
  json: string,
  display_msg: string,
  rpc: string | null = null
): Promise<TxResponse> =>
  new Promise<TxResponse>((resolve, reject) => {
    window.hive_keychain?.requestCustomJson(
      account,
      id,
      key,
      json,
      display_msg,
      (resp) => {
        if (!resp.success) {
          reject({ message: "Operation cancelled" });
        }
        resolve(resp);
      },
      rpc
    );
  });

export const broadcast = (
  account: string,
  operations: any[],
  key: AuthorityTypes,
  rpc: string | null = null
): Promise<TxResponse> =>
  new Promise<TxResponse>((resolve, reject) => {
    window.hive_keychain?.requestBroadcast(
      account,
      operations,
      key,
      (resp) => {
        if (!resp.success) {
          reject({ message: "Operation cancelled" });
        }

        resolve(resp);
      },
      rpc
    );
  });

export const addAccount = (username: string, keys: Keys): Promise<TxResponse> =>
  new Promise<TxResponse>((resolve, reject) => {
    window.hive_keychain?.requestAddAccount(username, keys, (resp) => {
      if (!resp.success) {
        reject({ message: "Operation cancelled" });
      }

      resolve(resp);
    });
  });

export const witnessVote = (
  account: string,
  witness: string,
  vote: boolean,
  rpc: string | null = null
): Promise<TxResponse> =>
  new Promise<TxResponse>((resolve, reject) => {
    window.hive_keychain?.requestWitnessVote(
      account,
      witness,
      vote,
      (resp) => {
        if (!resp.success) {
          reject({ message: "Operation cancelled" });
        }

        resolve(resp);
      },
      rpc
    );
  });

export const witnessProxy = (
  account: string,
  proxy: string,
  rpc: string | null = null
): Promise<TxResponse> =>
  new Promise<TxResponse>((resolve, reject) => {
    window.hive_keychain?.requestProxy(
      account,
      proxy,
      (resp) => {
        if (!resp.success) {
          reject({ message: "Operation cancelled" });
        }

        resolve(resp);
      },
      rpc
    );
  });

export interface KeyChainImpl {
  requestHandshake(callback: () => void): void;

  requestSignBuffer(
    account: string,
    message: string,
    key: AuthorityTypes,
    callback: (r: TxResponse) => void,
    rpc: string | null
  ): void;

  requestAddAccountAuthority(
    account: string,
    authorizedUsername: string,
    role: AuthorityTypes,
    weight: number,
    callback: (r: TxResponse) => void,
    rpc: string | null
  ): void;

  requestRemoveAccountAuthority(
    account: string,
    authorizedUsername: string,
    role: AuthorityTypes,
    callback: (r: TxResponse) => void,
    rpc: string | null
  ): void;

  requestTransfer(
    account: string,
    to: string,
    amount: string,
    memo: string,
    currency: Symbol,
    callback: (r: TxResponse) => void,
    enforce: boolean,
    rpc: string | null
  ): void;

  requestCustomJson(
    account: string,
    id: string,
    key: AuthorityTypes,
    json: string,
    display_msg: string,
    callback: (r: TxResponse) => void,
    rpc: string | null
  ): void;

  requestBroadcast(
    account: string,
    operations: any[],
    key: AuthorityTypes,
    callback: (r: TxResponse) => void,
    rpc: string | null
  ): void;

  requestAddAccount(username: string, keys: Keys, callback: (r: TxResponse) => void): void;

  requestWitnessVote(
    username: string,
    witness: string,
    vote: boolean,
    callback: (r: TxResponse) => void,
    rpc: string | null
  ): void;

  requestProxy(
    username: string,
    proxy: string,
    callback: (r: TxResponse) => void,
    rpc: string | null
  ): void;
}
