import express from "express";
import {AxiosResponse} from "axios";

import config from "../../config";

import {getTokenUrl, decodeToken} from "../../common/helper/hive-signer";

import {apiRequest, baseApiRequest} from "../helper";

const validateCode = (req: express.Request, res: express.Response): string | boolean => {
    const {code} = req.body;

    if (!code) {
        res.status(400).send("Bad Request");
        return false;
    }

    const dCode = decodeToken(code);

    if (!dCode || dCode.signed_message.app !== "ecency.app") {
        res.status(400).send("Bad Request");
        return false;
    }

    return dCode['authors'][0];
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

export const notifications = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;

    const {filter, since} = req.query;

    let u = `activities/${username}`

    if (filter) {
        u = `${filter}/${username}`
    }

    if (since) {
        u += `?since=${since}`;
    }

    pipe(apiRequest(u, "GET"), res);
}

export const unreadNotifications = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;

    pipe(apiRequest(`activities/${username}/unread-count`, "GET"), res);
}

export const markNotifications = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;

    const {id} = req.body;
    const data: { id?: string } = {};

    if (id) {
        data.id = id;
    }

    pipe(apiRequest(`activities/${username}`, "PUT", {}, data), res);
}

export const hsTokenRefresh = async (req: express.Request, res: express.Response) => {
    if (!validateCode(req, res)) return;

    const {code} = req.body;

    pipe(baseApiRequest(getTokenUrl(code, config.hsClientSecret), "GET"), res);
};

export const usrActivity = async (req: express.Request, res: express.Response) => {
    const us = validateCode(req, res);
    if (!us) return;

    const {ty, bl, tx} = req.body;

    const payload = {us, ty};

    if (bl) payload['bl'] = bl;
    if (tx) payload['tx'] = tx;

    pipe(apiRequest(`usr-activity`, "POST", {}, payload), res);
}

export const createAccount = async (req: express.Request, res: express.Response) => {
    const {username, email, referral} = req.body;

    const headers = {'X-Real-IP-V': req.headers['x-forwarded-for'] || ''};
    const payload = {username, email, referral};

    pipe(apiRequest(`signup/account-create`, "POST", headers, payload), res);
};
