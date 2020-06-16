import express from "express";
import axios from "axios";
import config from "../../config";

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
