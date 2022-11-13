import express from "express";
import { getCGMarketApi } from "../services";
import { cache } from "../cache";

export const coingeckoHandler = async (req: express.Request, res: express.Response) => {
  try {
    const data = await getCGMarketApi(req.query.ids as string, req.query.vs_currencies as string);
    cache.set(req.url, data);
    res.send(data);
  } catch (e) {
    const hasCached = cache.has(((req.query.ids as string) + req.query.vs_currencies) as string);
    if (hasCached) {
      res.send(cache.get(req.url));
      return;
    } else {
      res.sendStatus(400);
    }
  }
};
