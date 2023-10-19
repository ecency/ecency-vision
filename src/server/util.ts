import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";

import { Response } from "express";
import config from "../config";

export const pipe = (promise: Promise<AxiosResponse>, res: Response) => {
  promise
    .then((r) => {
      res.status(r.status).send(r.data);
    })
    .catch(() => {
      res.status(500).send("Server Error");
    });
};

export const baseApiRequest = (
  url: string,
  method: Method,
  headers: any = {},
  payload: any = {}
): Promise<AxiosResponse> => {
  const requestConf: AxiosRequestConfig = {
    url,
    method,
    validateStatus: () => true,
    responseType: "json",
    headers: { ...headers },
    data: { ...payload }
  };

  return axios(requestConf);
};

export const authCheck = (req: any, res: any, next: any) => {
  if (config.hsClientSecret && config.usePrivate !== "1") {
    next();
  } else {
    res.json({ error: "Define HIVESIGNER_SECRET ENV variable or set USE_PRIVATE=1" });
  }
};
