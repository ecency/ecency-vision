import { KeyRole, PrivateKey } from "@hiveio/dhive";
const { randomBytes } = require("crypto");

export interface KeyTypes {
      active?: string;
      activePubkey: string;
      memo?: string;
      memoPubkey: string;
      owner?: string;
      ownerPubkey: string;
      posting?: string;
      postingPubkey: string;
  }

export const getPrivateKeys = (username: any, password: any) => {
  const roles: Array<KeyRole> = ["owner", "active", "posting", "memo"];
  type keysType = {
    owner: string;
    active: string;
    posting: string;
    memo: string;
    ownerPubkey: string;
    activePubkey: string;
    postingPubkey: string;
    memoPubkey: string;
  };

  let privKeys: keysType = {
    owner: "",
    active: "",
    posting: "",
    memo: "",
    ownerPubkey: "",
    activePubkey: "",
    postingPubkey: "",
    memoPubkey: ""
  };
  roles.forEach((role) => {
    privKeys[role] = PrivateKey.fromLogin(username, password, role).toString();
    privKeys[`${role}Pubkey`] = PrivateKey.from(privKeys[role]).createPublic().toString();
  });

  return privKeys;
};

export const generatePassword = async (length: number) => {
  const password = `P${PrivateKey.fromSeed(randomBytes(length).toString("hex")).toString()}`;
  return password;
};
