import { Symbol } from "@/utils";

export interface TxResponse {
  success: boolean;
  result: string;
}

export type AuthorityTypes = "Owner" | "Active" | "Posting" | "Memo";

export type Keys = { active: any; posting: any; memo: any };

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
