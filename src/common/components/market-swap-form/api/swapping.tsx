import { MarketAsset } from "../market-pair";
import { PrivateKey } from "@hiveio/dhive";
import React from "react";

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
  fromAsset: MarketAsset;
  toAsset: MarketAsset;
  fromAmount: string;
  toAmount: string;
}

export const swapByKey = (key: PrivateKey, options: SwapOptions) => {};

export const swapByKc = (options: SwapOptions) => {};

export const swapByHs = (options: SwapOptions) => {};
