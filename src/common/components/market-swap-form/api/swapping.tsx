import { MarketAsset } from "../market-pair";
import { PrivateKey } from "@hiveio/dhive";
import React from "react";
import { ActiveUser } from "../../../store/active-user/types";
import { limitOrderCreate, limitOrderCreateHot, limitOrderCreateKc } from "../../../api/operations";
import { TransactionType } from "../../buy-sell-hive";

export enum SwappingMethod {
  KEY = "key",
  HS = "hs",
  KC = "kc",
  CUSTOM = "custom"
}

export const MarketSwappingMethods = {
  [MarketAsset.HIVE]: [SwappingMethod.HS, SwappingMethod.KC, SwappingMethod.KEY],
  [MarketAsset.HBD]: [SwappingMethod.HS, SwappingMethod.KC, SwappingMethod.KEY]
};

export interface SwapOptions {
  activeUser: ActiveUser | null;
  fromAsset: MarketAsset;
  fromAmount: string;
  toAmount: string;
}

export const swapByKey = (key: PrivateKey, options: SwapOptions) => {
  const fromAmount = +options.fromAmount.replace(/,/gm, "");
  const toAmount = +options.toAmount.replace(/,/gm, "");

  if (options.fromAsset === MarketAsset.HIVE) {
    return limitOrderCreate(
      options.activeUser!.username,
      key,
      toAmount,
      fromAmount,
      TransactionType.Sell
    );
  } else if (options.fromAsset === MarketAsset.HBD) {
    return limitOrderCreate(
      options.activeUser!.username,
      key,
      fromAmount,
      toAmount,
      TransactionType.Buy
    );
  }
  return Promise.reject();
};

export const swapByKc = (options: SwapOptions) => {
  const fromAmount = +options.fromAmount.replace(/,/gm, "");
  const toAmount = +options.toAmount.replace(/,/gm, "");

  if (options.fromAsset === MarketAsset.HIVE) {
    return limitOrderCreateKc(
      options.activeUser!.username,
      toAmount,
      fromAmount,
      TransactionType.Sell
    );
  } else if (options.fromAsset === MarketAsset.HBD) {
    return limitOrderCreateKc(
      options.activeUser!.username,
      fromAmount,
      toAmount,
      TransactionType.Buy
    );
  }
  return Promise.reject();
};

export const swapByHs = (options: SwapOptions) => {
  const fromAmount = +options.fromAmount.replace(/,/gm, "");
  const toAmount = +options.toAmount.replace(/,/gm, "");

  if (options.fromAsset === MarketAsset.HIVE) {
    return limitOrderCreateHot(
      options.activeUser!.username,
      toAmount,
      fromAmount,
      TransactionType.Sell
    );
  } else if (options.fromAsset === MarketAsset.HBD) {
    return limitOrderCreateHot(
      options.activeUser!.username,
      fromAmount,
      toAmount,
      TransactionType.Buy
    );
  }
};
