import express from "express";
import axios from "axios";
import config from "../../config";
import { getTokenUrl } from "../../common/helper/hive-signer";

const client = axios.create({
  baseURL: config.privateApiAddr,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
    ...config.privateApiAuth,
  },
});

export const receivedVestingHandler = async (req: express.Request, res: express.Response) => {
  const { username } = req.params;

  let r;

  try {
    r = await client.get(`/delegatee_vesting_shares/${username}`);
  } catch (e) {
    res.status(500).send("Server Error");
    return;
  }

  return res.send(r.data);
};

export const hsTokenRefresh = async (req: express.Request, res: express.Response) => {
  const { code } = req.body;
  if (!code) {
    res.status(500).send("Bad Request");
    return;
  }

  let r: any;

  try {
    const u = getTokenUrl(code, config.hsClientSecret);
    r = await axios.get(u, {
      validateStatus: (status) => {
        return true;
      },
    });
  } catch (e) {
    res.status(500).send("Server Error");
    return;
  }

  return res.status(r.status).send(r.data);
};
