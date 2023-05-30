import { Account, FullAccount } from "../../../store/accounts/types";
import { PublicKey } from "@hiveio/dhive";

export const Keytype = {
  Owner: "owner",
  Active: "active",
  Posting: "posting",
  Memo: "memo"
};

export interface PublicKeys {
  publicOwnerKey?: string;
  publicActiveKey?: string;
  publicPostingKey?: string;
  publicMemoKey?: string;
}

export interface AccountDataType {
  postingsAuthority: [string, number][];
  posting: [string | PublicKey, number];
  owner: [string | PublicKey, number];
  active: [string | PublicKey, number];
  weight: number;
  memokey: string;
  account: Account;
  publicKeys: {
    publicOwnerKey: string | PublicKey;
    publicActiveKey: string | PublicKey;
    publicPostingKey: string | PublicKey;
    publicMemoKey: string;
  };
}

export const actionType = {
  Revoke: "revoke",
  Keys: "keys",
  Import: "import",
  Reveal: "reveal"
};
