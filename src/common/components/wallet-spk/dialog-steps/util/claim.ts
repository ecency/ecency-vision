import { PrivateKey } from "@hiveio/dhive";
import { claimLarynxByKey, claimLarynxByHs, claimLarynxByKc } from "../../../../api/spk-api";

export const claimByKey = (key: PrivateKey, asset: string, username: string) => {
  switch (asset) {
    case "LARYNX":
      return claimLarynxByKey(username, key);
    default:
      throw new Error("Claiming modal not configured.");
  }
};

export const claimByKc = (asset: string, username: string) => {
  switch (asset) {
    case "LARYNX":
      return claimLarynxByKc(username);
    default:
      throw new Error("Claiming modal not configured.");
  }
};

export const claimByHs = (asset: string, from: string) => {
  switch (asset) {
    case "LARYNX":
      claimLarynxByHs(from);
      break;
    default:
      throw new Error("Claiming modal not configured.");
  }
};
