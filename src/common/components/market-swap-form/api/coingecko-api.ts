import axios from "axios";
import { MarketAsset } from "../market-pair";
import isElectron from "../../../util/is-electron";

interface CoinGeckoApiResponse {
  [key: string]: {
    [vsKey: string]: number;
  };
}

const getCGMarketApi = async (ids: string, vs: string): Promise<CoinGeckoApiResponse> => {
  let resp;
  if (isElectron()) {
    resp = await axios.get<CoinGeckoApiResponse>("https://api.coingecko.com/api/v3/simple/price", {
      params: {
        ids,
        vs_currencies: vs,
        include_24hr_change: false
      }
    });
  } else {
    resp = await axios.get<CoinGeckoApiResponse>("/coingecko/api/v3/simple/price", {
      params: {
        ids,
        vs_currencies: vs
      }
    });
  }
  return resp.data;
};

const getId = (asset: MarketAsset) => {
  if (asset === MarketAsset.HIVE) return "hive";
  if (asset === MarketAsset.HBD) return "hive_dollar";
  return "";
};

export const getCGMarket = async (
  fromAsset: MarketAsset,
  toAsset: MarketAsset
): Promise<number[]> => {
  let ids = `${getId(fromAsset)},${getId(toAsset)}`;
  const market = await getCGMarketApi(ids, "usd");
  return [market[getId(fromAsset)].usd, market[getId(toAsset)].usd];
};
