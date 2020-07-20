import express from "express";
import axios, {Method, AxiosRequestConfig} from "axios";
import config from "../../config";
import {getTokenUrl} from "../../common/helper/hive-signer";

const baseRequest = (url: string, method: Method, headers: any = {}, payload: any = {}): Promise<any> => {
    const requestConf: AxiosRequestConfig = {
        url,
        method,
        validateStatus: () => true,
        responseType: "json",
        headers: {...headers},
        data: {...payload}
    }

    return axios(requestConf).then(r => r.data);
}

const apiRequest = (endpoint: string, method: Method, extraHeaders: any = {}, payload: any = {}): Promise<any> => {
    const url = `${config.privateApiAddr}/${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        ...config.privateApiAuth,
        ...extraHeaders
    }

    return baseRequest(url, method, headers, payload)
}
export const receivedVesting = async (req: express.Request, res: express.Response) => {
    const {username} = req.params;

    try {
        return res.send(await apiRequest(`delegatee_vesting_shares/${username}`, "GET"))
    } catch (e) {
        return res.status(500).send("Server Error");
    }
};

export const hsTokenRefresh = async (req: express.Request, res: express.Response) => {
    const {code} = req.body;
    if (!code) {
        res.status(400).send("Bad Request");
        return;
    }

    try {
        return res.send(await baseRequest(getTokenUrl(code, config.hsClientSecret), "GET"))
    } catch (e) {
        return res.status(500).send("Server Error");
    }
};


export const createAccount = async (req: express.Request, res: express.Response) => {
    const {username, email, referral} = req.body;

    const headers = {'X-Real-IP-V': req.headers['x-forwarded-for'] || ''};
    const payload = {username, email, referral};

    try {
        return res.send(await apiRequest(`signup/account-create`, "POST", headers, payload))
    } catch (e) {
        return res.status(500).send("Server Error");
    }
};
