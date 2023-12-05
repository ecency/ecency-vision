import { SMTAsset } from "@hiveio/dhive";

export enum Symbol {
  HIVE = "HIVE",
  HBD = "HBD",
  VESTS = "VESTS",
  SPK = "SPK"
}

export enum NaiMap {
  "@@000000021" = "HIVE",
  "@@000000013" = "HBD",
  "@@000000037" = "VESTS"
}

export interface Asset {
  amount: number;
  symbol: Symbol;
}

export function parseAsset(sval: string | SMTAsset): Asset {
  if (typeof sval === "string") {
    const sp = sval.split(" ");
    return {
      amount: parseFloat(sp[0]),
      // @ts-ignore
      symbol: Symbol[sp[1]]
    };
  } else {
    return {
      amount: parseFloat(sval.amount.toString()) / Math.pow(10, sval.precision),
      // @ts-ignore
      symbol: NaiMap[sval.nai]
    };
  }
}
