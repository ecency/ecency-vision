import { Account } from "../../../store/accounts/types";

export const Keytype = {
  Owner: "owner",
  Active: "active",
  Posting: "posting"
};

export interface PublicKeys {
  publicOwnerKey?: any;
  publicActiveKey?: any;
  publicPostingKey?: any;
}

export interface AccountDataType {
  postingsAuthority: Array<any>;
  posting: Array<any>;
  owner: Array<any>;
  active: Array<any>;
  weight: number;
  memokey: string;
  account: Account;
  PublicKeys: {
    publicOwnerKey: any;
    publicActiveKey: any;
    publicPostingKey: any;
  };
}

export const actionType = {
  Revoke: "revoke"
};
