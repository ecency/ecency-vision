import express from "express";

import {AxiosResponse} from "axios";

import {Client, QueryResult} from "pg";

import config from "../../config";

import {cache} from "../cache";

import {getTokenUrl, decodeToken} from "../../common/helper/hive-signer";

import {apiRequest, baseApiRequest} from "../helper";

const validateCode = (req: express.Request, res: express.Response): string | false => {
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
};

const pipe = (promise: Promise<AxiosResponse>, res: express.Response) => {
    promise.then(r => {
        res.status(r.status).send(r.data);
    }).catch(() => {
        res.status(500).send("Server Error");
    });
};

export const createAccount = async (req: express.Request, res: express.Response) => {
    const {username, email, referral} = req.body;

    const headers = {'X-Real-IP-V': req.headers['x-forwarded-for'] || ''};
    const payload = {username, email, referral};

    pipe(apiRequest(`signup/account-create`, "POST", headers, payload), res);
};

export const receivedVesting = async (req: express.Request, res: express.Response) => {
    const {username} = req.params;
    pipe(apiRequest(`delegatee_vesting_shares/${username}`, "GET"), res);
};

export const leaderboard = async (req: express.Request, res: express.Response) => {
    const {duration} = req.body;
    pipe(apiRequest(`leaderboard?duration=${duration}`, "GET"), res);
};

export const popularUsers = async (req: express.Request, res: express.Response) => {

    let discovery = cache.get("discovery");

    if (discovery === undefined) {
        const client = new Client({
            connectionString: config.hiveUri,
        });

        await client.connect();

        const sql = `SELECT drv3.author AS name, ac.display_name, ac.about, ac.reputation 
            FROM (
               SELECT DISTINCT author
               FROM (
                      SELECT *
                      FROM (
                             SELECT
                               author,
                               author_rep
                             FROM hive_posts_cache
                             WHERE depth = 0
                             ORDER BY post_id DESC
                             LIMIT 10000
                           ) AS drv1
                      WHERE author_rep >= 70
                      ORDER BY author_rep DESC
                    ) AS drv2
            ) AS drv3
            LEFT JOIN hive_accounts AS ac ON ac.name = drv3.author 
            WHERE ac.display_name!='' AND ac.about != '' 
            ORDER BY random() LIMIT 260;`;

        let r: QueryResult;

        try {
            r = await client.query(sql);
        } catch (e) {
            return res.status(500).send("Server Error");
        } finally {
            await client.end();
        }

        discovery = r.rows;

        cache.set("discovery", discovery, 86400);
    }

    return res.send(discovery);
};

/* Login required endpoints */

export const hsTokenRefresh = async (req: express.Request, res: express.Response) => {
    if (!validateCode(req, res)) return;

    const {code} = req.body;

    pipe(baseApiRequest(getTokenUrl(code, config.hsClientSecret), "GET"), res);
};

export const notifications = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;

    const {filter, since} = req.body;

    let u = `activities/${username}`

    if (filter) {
        u = `${filter}/${username}`
    }

    if (since) {
        u += `?since=${since}`;
    }

    pipe(apiRequest(u, "GET"), res);
};

export const unreadNotifications = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;

    pipe(apiRequest(`activities/${username}/unread-count`, "GET"), res);
};

export const markNotifications = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;

    const {id} = req.body;
    const data: { id?: string } = {};

    if (id) {
        data.id = id;
    }

    pipe(apiRequest(`activities/${username}`, "PUT", {}, data), res);
};

export const usrActivity = async (req: express.Request, res: express.Response) => {
    const us = validateCode(req, res);
    if (!us) return;

    const {ty, bl, tx} = req.body;

    const payload = {us, ty};

    if (bl) payload['bl'] = bl;
    if (tx) payload['tx'] = tx;

    pipe(apiRequest(`usr-activity`, "POST", {}, payload), res);
};

export const images = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;

    pipe(apiRequest(`images/${username}`, "GET"), res);
}

export const imagesDelete = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`images/${username}/${id}`, "DELETE"), res);
}

export const imagesAdd = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    const {url} = req.body;
    const data = {username, image_url: url};
    pipe(apiRequest(`image`, "POST", {}, data), res);
}

export const drafts = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`drafts/${username}`, "GET"), res);
}

export const draftsAdd = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    const {title, body, tags} = req.body;
    const data = {username, title, body, tags};
    pipe(apiRequest(`draft`, "POST", {}, data), res);
}

export const draftsUpdate = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    const {id, title, body, tags} = req.body;
    const data = {username, title, body, tags};
    pipe(apiRequest(`drafts/${username}/${id}`, "PUT", {}, data), res);
}

export const draftsDelete = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`drafts/${username}/${id}`, "DELETE"), res);
}

export const bookmarks = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`bookmarks/${username}`, "GET"), res);
}

export const bookmarksAdd = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    const {author, permlink} = req.body;
    const data = {username, author, permlink, chain: 'steem'};
    pipe(apiRequest(`bookmark`, "POST", {}, data), res);
}

export const bookmarksDelete = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`bookmarks/${username}/${id}`, "DELETE"), res);
}

export const favorites = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`favorites/${username}`, "GET"), res);
}

export const favoritesCheck = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`isfavorite/${username}`, "GET"), res);
}

export const favoritesAdd = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    const {account} = req.body;
    const data = {username, account};
    pipe(apiRequest(`bookmark`, "POST", {}, data), res);
}

export const favoritesDelete = async (req: express.Request, res: express.Response) => {
    const username = validateCode(req, res);
    if (!username) return;
    const {account} = req.body;
    pipe(apiRequest(`favoriteUser/${username}/${account}`, "DELETE"), res);
}
