import axios from "axios";

interface CoinGeckoApiResponse {
  [key: string]: {
    [vsKey: string]: number;
  };
}

export async function getCGMarketApi(ids: string, vs: string): Promise<CoinGeckoApiResponse> {
  const resp = await axios
    .get<CoinGeckoApiResponse>("https://api.coingecko.com/api/v3/simple/price", {
      params: {
        ids,
        vs_currencies: vs,
        include_24hr_change: false
      }
    })
    .catch((e) => {
      console.log(e);
      throw new Error("api dead");
    });
  return resp.data;
}
