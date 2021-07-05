import axios from 'axios';
import {Request, Response} from "express";

import {cache} from "../cache";

export const getCachedCurrencyRate = async (req: Request, res: Response) => {
    const {cur} = req.params;
    if (cur === "hbd") {
      res.json({price: 1});
    }
    let crate: number | undefined = cache.get(`crate-${cur}`);
    if (!crate) {
      const u = `https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=${cur}`;
      try {
        crate = (await axios.get(u).then(r => r.data).then(r => r.hive_dollar[cur]))
      } catch (error) {
        crate = undefined;
      }
      cache.set(`crate-${cur}`, crate, 3600);
    }
    res.json({price: crate});
}