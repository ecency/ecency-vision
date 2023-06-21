import { KeyRole, PrivateKey } from "@hiveio/dhive";
import { randomBytes } from "crypto";
import axios from "axios";
import { apiBase } from "../api/helper";

export const getPrivateKeys = (username: any, password: any) => {
  const roles: Array<KeyRole> = ["owner", "active", "posting", "memo"];
  type keysType = {
    ownerPubkey: string;
    activePubkey: string;
    postingPubkey: string;
    memoPubkey: string;
  };
  const privKeys: keysType = {
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

export const sendOnboardMail = async (username: string, email: string, friend: string) => {
  const dataBody = {
    username,
    email,
    friend,
  };

  try {
    const response = await axios.post(
      apiBase(`/private-api/account-create-friend`),
      dataBody,
      {
        headers: { "Content-type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
  }
}
