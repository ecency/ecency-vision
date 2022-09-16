import { PrivateKey } from "@hiveio/dhive";
import { lockLarynxByHs, lockLarynxByKc, lockLarynxByKey } from "../../../../api/spk-api";

export const lockByKey = (
  mode: "lock" | "unlock",
  key: PrivateKey,
  asset: string,
  username: string,
  amount: string
) => {
  switch (asset) {
    case "LARYNX":
      return lockLarynxByKey(mode, key, username, amount);
    default:
      throw new Error("Delegation modal not configured.");
  }
};

export const lockByKc = (
  mode: "lock" | "unlock",
  asset: string,
  username: string,
  amount: string
) => {
  switch (asset) {
    case "LARYNX":
      return lockLarynxByKc(mode, username, amount);
    default:
      throw new Error("Delegation modal not configured.");
  }
};

export const lockByHs = (mode: "lock" | "unlock", asset: string, from: string, amount: string) => {
  switch (asset) {
    case "LARYNX":
      return lockLarynxByHs(mode, from, amount);
    default:
      throw new Error("Delegation modal not configured.");
  }
};
