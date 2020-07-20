import express from "express";
import axios, {Method, AxiosRequestConfig, AxiosResponse} from "axios";

import config from "../../config";

import {getTokenUrl, decodeToken} from "../../common/helper/hive-signer";

const baseRequest = (url: string, method: Method, headers: any = {}, payload: any = {}): Promise<AxiosResponse> => {
    const requestConf: AxiosRequestConfig = {
        url,
        method,
        validateStatus: () => true,
        responseType: "json",
        headers: {...headers},
        data: {...payload}
    }

    return axios(requestConf)
}

const apiRequest = (endpoint: string, method: Method, extraHeaders: any = {}, payload: any = {}): Promise<AxiosResponse> => {
    const url = `${config.privateApiAddr}/${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        ...config.privateApiAuth,
        ...extraHeaders
    }

    return baseRequest(url, method, headers, payload)
}

const pipe = (promise: Promise<AxiosResponse>, res: express.Response) => {
    promise.then(r => {
        res.status(r.status).send(r.data);
    }).catch(() => {
        res.status(500).send("Server Error");
    });
}

export const receivedVesting = async (req: express.Request, res: express.Response) => {
    const {username} = req.params;

    pipe(apiRequest(`delegatee_vesting_shares/${username}`, "GET"), res);
};

export const hsTokenRefresh = async (req: express.Request, res: express.Response) => {
    const {code} = req.body;
    if (!code) {
        res.status(400).send("Bad Request");
        return;
    }

    pipe(baseRequest(getTokenUrl(code, config.hsClientSecret), "GET"), res);
};


export const createAccount = async (req: express.Request, res: express.Response) => {
    const {username, email, referral} = req.body;

    const headers = {'X-Real-IP-V': req.headers['x-forwarded-for'] || ''};
    const payload = {username, email, referral};

    pipe(apiRequest(`signup/account-create`, "POST", headers, payload), res);
};

export const usrActivity = async (req: express.Request, res: express.Response) => {
    const {code, ty, bl, tx} = req.body;
    const dCode = decodeToken(code);

    if (!dCode || dCode.signed_message.app !== "ecency.app") {
        res.status(400).send("Bad Request");
        return;
    }

    const [us,] = dCode['authors'];

    const payload = {us, ty};

    if (bl) payload['bl'] = bl;
    if (tx) payload['tx'] = tx;

    pipe(apiRequest(`usr-activity`, "POST", {}, payload), res);
}
