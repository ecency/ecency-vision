import express from "express";

import {decodeToken, getTokenUrl} from "../../common/helper/hive-signer";

import {baseApiRequest, pipe} from "../util";

import config from "../../config";

export const hsTokenRefresh = async (req: express.Request, res: express.Response) => {
    const {code} = req.body;
    if (!decodeToken(code)) return;

    pipe(baseApiRequest(getTokenUrl(code, config.hsClientSecret), "GET"), res);
};