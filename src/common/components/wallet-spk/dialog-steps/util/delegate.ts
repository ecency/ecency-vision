import { PrivateKey } from "@hiveio/dhive";
import {
  delegateLarynxByHs,
  delegateLarynxByKc,
  delegateLarynxByKey
} from "../../../../api/spk-api";

export const delegateByKey = (
  key: PrivateKey,
  asset: string,
  username: string,
  to: string,
  amount: string
) => {
  switch (asset) {
    case "LP":
      return delegateLarynxByKey(username, key, to, amount);
    default:
      throw new Error("Delegation modal not configured.");
  }
};

export const delegateByKc = (asset: string, username: string, to: string, amount: string) => {
  switch (asset) {
    case "LP":
      return delegateLarynxByKc(username, to, amount);
    default:
      throw new Error("Delegation modal not configured.");
  }
};

export const delegateByHs = (asset: string, from: string, to: string, amount: string) => {
  switch (asset) {
    case "LP":
      delegateLarynxByHs(from, to, amount);
      break;
    default:
      throw new Error("Delegation modal not configured.");
  }
};
