import { PrivateKey } from "@hiveio/dhive";
import {
  sendLarynxByHs,
  sendSpkByHs,
  transferLarynxByKc,
  transferLarynxByKey,
  transferSpkByKc,
  transferSpkByKey
} from "../../../../api/spk-api";

export const transferByKey = (
  key: PrivateKey,
  asset: string,
  username: string,
  to: string,
  amount: string,
  memo: string
) => {
  switch (asset) {
    case "SPK":
      return transferSpkByKey(username, key, to, amount, memo);
    case "LARYNX":
      return transferLarynxByKey(username, key, to, amount, memo);
    default:
      throw new Error("Transferring modal not configured.");
  }
};

export const transferByKc = (
  asset: string,
  username: string,
  to: string,
  amount: string,
  memo: string
) => {
  switch (asset) {
    case "SPK":
      return transferSpkByKc(username, to, amount, memo);
    case "LARYNX":
      return transferLarynxByKc(username, to, amount, memo);
    default:
      throw new Error("Transferring modal not configured.");
  }
};

export const transferByHs = (
  asset: string,
  from: string,
  to: string,
  amount: string,
  memo: string
) => {
  switch (asset) {
    case "SPK":
      sendSpkByHs(from, to, amount, memo);
      break;
    case "LARYNX":
      sendLarynxByHs(from, to, amount, memo);
      break;
    default:
      throw new Error("Transferring modal not configured.");
  }
};
