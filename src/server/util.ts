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

export const cleanURL = (req: any, res: any, next: any) => {
  if (req.url.includes("//")) {
    res.redirect(req.url.replace(new RegExp("/{2,}", "g"), "/"));
    return;
  }
  if (req.url.includes("@@")) {
    res.redirect(req.url.replace(new RegExp("@{2,}", "g"), "@"));
    return;
  }
  if (req.url.includes("-hs?code")) {
    next();
  } else if (
    req.url !== req.url.toLowerCase() &&
    !req.url.includes("auth?code") &&
    !req.url.includes("onboard-friend/")
  ) {
    res.redirect(301, req.url.toLowerCase());
    return;
  } else {
    next();
  }
};

export const stripLastSlash = (req: any, res: any, next: any) => {
  if (req.path.substr(-1) === "/" && req.path.length > 1) {
    let query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
    return;
  } else {
    next();
  }
};

export const authCheck = (req: any, res: any, next: any) => {
  if (config.hsClientSecret && config.usePrivate !== "1") {
    next();
  } else {
    res.json({ error: "Define HIVESIGNER_SECRET ENV variable or set USE_PRIVATE=1" });
  }
};
