import express from "express";

import hs from "hivesigner";

import {apiRequest, getPromotedEntries} from "../helper";

import {pipe} from "../util";

const validateCode = async (req: express.Request, res: express.Response): Promise<string | false> => {
    const {code} = req.body;

    if (!code) {
        res.status(400).send("Bad Request");
        return false;
    }

    try {
        return await (new hs.Client({accessToken: code}).me().then((r: { name: string }) => r.name));
    } catch (e) {
        res.status(401).send("Unauthorized");
        return false;
    }
};

export const receivedVesting = async (req: express.Request, res: express.Response) => {
    const {username} = req.params;
    pipe(apiRequest(`delegatee_vesting_shares/${username}`, "GET"), res);
};

export const rewardedCommunities = async (req: express.Request, res: express.Response) => {
    pipe(apiRequest(`rewarded-communities`, "GET"), res);
};

export const leaderboard = async (req: express.Request, res: express.Response) => {
    const {duration} = req.params;
    pipe(apiRequest(`leaderboard?duration=${duration}`, "GET"), res);
};

export const promotedEntries = async (req: express.Request, res: express.Response) => {
    const posts = await getPromotedEntries();
    res.send(posts);
};

export const commentHistory = async (req: express.Request, res: express.Response) => {
    const {author, permlink, onlyMeta} = req.body;

    let u = `comment-history/${author}/${permlink}`;
    if (onlyMeta === '1') {
        u += '?only_meta=1';
    }

    pipe(apiRequest(u, "GET"), res);
};

export const points = async (req: express.Request, res: express.Response) => {
    const {username} = req.body;
    pipe(apiRequest(`users/${username}`, "GET"), res);
};

export const pointList = async (req: express.Request, res: express.Response) => {
    const {username} = req.body;
    pipe(apiRequest(`users/${username}/points?size=50`, "GET"), res);
};

export const createAccount = async (req: express.Request, res: express.Response) => {
    const {username, email, referral} = req.body;

    const headers = {'X-Real-IP-V': req.headers['x-forwarded-for'] || ''};
    const payload = {username, email, referral};

    pipe(apiRequest(`signup/account-create`, "POST", headers, payload), res);
};

/* Login required endpoints */

export const notifications = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
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
    const username = await validateCode(req, res);
    if (!username) return;

    pipe(apiRequest(`activities/${username}/unread-count`, "GET"), res);
};

export const markNotifications = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;

    const {id} = req.body;
    const data: { id?: string } = {};

    if (id) {
        data.id = id;
    }

    pipe(apiRequest(`activities/${username}`, "PUT", {}, data), res);
};

export const usrActivity = async (req: express.Request, res: express.Response) => {
    const us = await validateCode(req, res);
    if (!us) return;

    const {ty, bl, tx} = req.body;

    const payload = {us, ty};

    if (bl) payload['bl'] = bl;
    if (tx) payload['tx'] = tx;

    pipe(apiRequest(`usr-activity`, "POST", {}, payload), res);
};

export const images = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;

    pipe(apiRequest(`images/${username}`, "GET"), res);
}

export const imagesDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`images/${username}/${id}`, "DELETE"), res);
}

export const imagesAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {url} = req.body;
    const data = {username, image_url: url};
    pipe(apiRequest(`image`, "POST", {}, data), res);
}

export const drafts = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`drafts/${username}`, "GET"), res);
}

export const draftsAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {title, body, tags} = req.body;
    const data = {username, title, body, tags};
    pipe(apiRequest(`draft`, "POST", {}, data), res);
}

export const draftsUpdate = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id, title, body, tags} = req.body;
    const data = {username, title, body, tags};
    pipe(apiRequest(`drafts/${username}/${id}`, "PUT", {}, data), res);
}

export const draftsDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`drafts/${username}/${id}`, "DELETE"), res);
}

export const bookmarks = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`bookmarks/${username}`, "GET"), res);
}

export const bookmarksAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {author, permlink} = req.body;
    const data = {username, author, permlink, chain: 'steem'};
    pipe(apiRequest(`bookmark`, "POST", {}, data), res);
}

export const bookmarksDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`bookmarks/${username}/${id}`, "DELETE"), res);
}

export const schedules = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`schedules/${username}`, "GET"), res);
}

export const schedulesAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;

    const {permlink, title, body, meta, options, schedule, reblog} = req.body;

    const data = {username, permlink, title, body, meta, options, schedule, reblog: reblog ? 1 : 0};
    pipe(apiRequest(`schedules`, "POST", {}, data), res);
}

export const schedulesDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`schedules/${username}/${id}`, "DELETE"), res);
}

export const schedulesMove = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`schedules/${username}/${id}`, "PUT"), res);
}

export const favorites = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`favorites/${username}`, "GET"), res);
}

export const favoritesCheck = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {account} = req.body;
    pipe(apiRequest(`isfavorite/${username}/${account}`, "GET"), res);
}

export const favoritesAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {account} = req.body;
    const data = {username, account};
    pipe(apiRequest(`favorite`, "POST", {}, data), res);
}

export const favoritesDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {account} = req.body;
    pipe(apiRequest(`favoriteUser/${username}/${account}`, "DELETE"), res);
}

export const fragments = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`fragments/${username}`, "GET"), res);
}

export const fragmentsAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {title, body} = req.body;
    const data = {username, title, body};
    pipe(apiRequest(`fragment`, "POST", {}, data), res);
}

export const fragmentsUpdate = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id, title, body} = req.body;
    const data = {title, body};
    pipe(apiRequest(`fragments/${username}/${id}`, "PUT", {}, data), res);
}

export const fragmentsDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`fragments/${username}/${id}`, "DELETE"), res);
}

export const pointsClaim = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const data = {us: username};
    pipe(apiRequest(`claim`, "PUT", {}, data), res);
}

export const pointsCalc = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {amount} = req.body;
    pipe(apiRequest(`estm-calc?username=${username}&amount=${amount}`, "GET"), res);
}

export const promotePrice = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`promote-price`, "GET"), res);
}

export const promotedPost = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {author, permlink} = req.body;
    pipe(apiRequest(`promoted-posts/${author}/${permlink}`, "GET"), res);
}

export const boostOptions = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`boost-options`, "GET"), res);
}

export const boostedPost = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {author, permlink} = req.body;
    pipe(apiRequest(`boosted-posts/${author}/${permlink}`, "GET"), res);
}
