import defaults from "@/defaults.json";
import { apiBase } from "./helper";
import { InfiniteData, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";

export const getEmojiData = () => fetch(apiBase("/emoji.json")).then((response) => response.json());

export const uploadImage = async (
  file: File,
  token: string
): Promise<{
  url: string;
}> => {
  const fData = new FormData();
  fData.append("file", file);

  const postUrl = `${defaults.imageServer}/hs/${token}`;

  return appAxios
    .post(postUrl, fData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
    .then((r) => r.data);
};

export const getMarketData = (
  coin: string,
  vsCurrency: string,
  fromTs: string,
  toTs: string
): Promise<{ prices?: [number, number] }> => {
  const u = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart/range?vs_currency=${vsCurrency}&from=${fromTs}&to=${toTs}`;
  return axios.get(u).then((r) => r.data);
};

export const getCurrencyRate = (cur: string): Promise<number> => {
  if (cur === "hbd") {
    return new Promise((resolve) => resolve(1));
  }

  const u = `https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=${cur}`;
  return axios
    .get(u)
    .then((r) => r.data)
    .then((r) => r.hive_dollar[cur]);
};

export const GIPHY_API_KEY = "DQ7mV4VsZ749GcCBZEunztICJ5nA4Vef";
export const GIPHY_API = `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=10&offset=0`;
export const GIPHY_SEARCH_API = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&limit=40&offset=0&q=`;

export function useFetchGifQuery(query: string, limit: number) {
  return useInfiniteQuery<any[], Error, InfiniteData<any[]>, QueryKey, number>({
    queryKey: [QueryIdentifiers.GIFS, query],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("q", query);
      params.set("api_key", GIPHY_API_KEY);
      params.set("limit", limit.toString());
      params.set("offset", pageParam.toString());

      return axios(`https://api.giphy.com/v1/gifs/search?${params.toString()}`);
    },
    initialPageParam: 0,
    initialData: { pages: [], pageParams: [] },
    getNextPageParam: (_, __, lastPageParam) => (lastPageParam ?? 0) + 50
  });
}
