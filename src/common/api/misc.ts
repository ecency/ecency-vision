import axios from "axios";

import defaults from "../constants/defaults.json";

import { apiBase } from "./helper";

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

  return axios
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

export const geLatestDesktopTag = (): Promise<string> =>
  axios
    .get("https://api.github.com/repos/ecency/ecency-vision/releases/latest")
    .then((r) => r.data)
    .then((r) => r.tag_name);

export const GIPHY_API_KEY = "DQ7mV4VsZ749GcCBZEunztICJ5nA4Vef";
export const GIPHY_API = `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=10&offset=0`;
export const GIPHY_SEARCH_API = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&limit=40&offset=0&q=`;

export const fetchGif = async (query: string | null, limit: string, offset: string) => {
  let gifs;
  if (query) {
    gifs = await axios(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&limit=${limit}&offset=${offset}&q=${query}`
    );
  } else {
    gifs = await axios(
      `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&offset=${offset}`
    );
  }
  return gifs;
};

export const marketInfo = async (): Promise<number> => {

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=hive%2C%20hive_dollar&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
  const data = await axios.get(url)
  .then((r: any) => r.data)  
  return data;
};

export const marketChart = async (token: string): Promise<number> => {

  const url = `https://api.coingecko.com/api/v3/coins/${token}/market_chart?vs_currency=usd&days=30`;
  const data = await axios.get(url)
  .then((r: any) => r.data)
  return data;
};
