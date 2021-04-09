import axios from 'axios';

import defaults from "../constants/defaults.json";

import {apiBase} from "./helper";

export const getEmojiData = () => fetch(apiBase("/emoji.json")).then((response) => response.json());

export const uploadImage = async (file: File, token: string): Promise<{
    url: string
}> => {
    const fData = new FormData();
    fData.append('file', file);

    const postUrl = `${defaults.imageServer}/hs/${token}`;

    return axios.post(postUrl, fData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(r => r.data);
};

export const getMarketData = (coin: string, vsCurrency: string, fromTs: string, toTs: string): Promise<{ prices?: [number, number] }> => {
    const u = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart/range?vs_currency=${vsCurrency}&from=${fromTs}&to=${toTs}`
    return axios.get(u).then(r => r.data);
}

export const getCurrencyRate = (cur: string) => {
    const u = `https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=${cur}`;
    return axios.get(u).then(r => r.data).then(r => r.hive_dollar[cur]);
}

export const geLatestDesktopTag = (): Promise<string> =>
    axios.get("https://api.github.com/repos/ecency/ecency-vision/releases/latest")
        .then(r => r.data)
        .then(r => r.tag_name);
