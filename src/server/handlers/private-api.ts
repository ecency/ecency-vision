import express from "express";
import {AxiosResponse} from "axios";

import config from "../../config";

import {getTokenUrl, decodeToken} from "../../common/helper/hive-signer";

import {apiRequest, baseApiRequest} from "../helper";

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

    pipe(baseApiRequest(getTokenUrl(code, config.hsClientSecret), "GET"), res);
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

    if (!dCode || dCode.signed_message.app !== config.masterAccount) {
        res.status(400).send("Bad Request");
        return;
    }

    const [us,] = dCode['authors'];

    const payload = {us, ty};

    if (bl) payload['bl'] = bl;
    if (tx) payload['tx'] = tx;

    pipe(apiRequest(`usr-activity`, "POST", {}, payload), res);
}
