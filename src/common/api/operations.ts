const hs = require("hivesigner");

import {Client as HiveClient, PrivateKey, Operation, TransactionConfirmation} from '@hiveio/dhive';

import {usrActivity} from "./private";

import {getAccessToken} from "../helper/user-token";

import {User} from "../store/users/types";

import SERVERS from "../constants/servers.json";

export interface MetaData {
    links?: string[];
    image?: string[];
    users?: string[];
    tags?: string[];
    app?: string;
    format?: string;
    community?: string;
}

export interface BeneficiaryRoute {
    account: string;
    weight: number;
}

export interface CommentOptions {
    allow_curation_rewards: boolean;
    allow_votes: boolean;
    author: string;
    permlink: string;
    max_accepted_payout: string;
    percent_steem_dollars?: number;
    percent_hbd?: number;
    extensions: Array<[0, { beneficiaries: BeneficiaryRoute[] }]>;
}

export type RewardType = "default" | "sp" | "dp";

export const formatError = (err: any) => {
    if (err.error_description) {
        return err.error_description.substring(0, 80);
    }
};

export const reblog = (username: string, author: string, permlink: string): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    return client.reblog(username, author, permlink)
        .then((r: any) => r.result)
        .then((r: TransactionConfirmation) => {
            usrActivity(username, 130, r.block_num, r.id).then();
            return r;
        })
};

export const comment = (
    username: string,
    parentAuthor: string,
    parentPermlink: string,
    permlink: string,
    title: string,
    body: string,
    jsonMetadata: MetaData,
    options: CommentOptions | null
): Promise<TransactionConfirmation> => {

    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    const params = {
        parent_author: parentAuthor,
        parent_permlink: parentPermlink,
        author: username,
        permlink,
        title,
        body,
        json_metadata: JSON.stringify(jsonMetadata),
    };

    const opArray: any[] = [["comment", params]];

    if (options) {
        const e = ["comment_options", options];
        opArray.push(e);
    }

    return client.broadcast(opArray)
        .then((r: any) => r.result)
        .then((r: TransactionConfirmation) => {
            const t = title ? 100 : 110;
            usrActivity(username, t, r.block_num, r.id).then();
            return r;
        })
};

export const deleteComment = (username: string, author: string, permlink: string): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username)
    });

    const params = {
        author,
        permlink,
    };

    const opArray = [["delete_comment", params]];

    return client.broadcast(opArray).then((r: any) => r.result)
};


export const vote = (username: string, author: string, permlink: string, weight: number): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    return client.vote(username, author, permlink, weight)
        .then((r: any) => r.result)
        .then((r: TransactionConfirmation) => {
            usrActivity(username, 120, r.block_num, r.id).then();
            return r;
        })
};

export const follow = (follower: string, following: string): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(follower),
    });

    return client.follow(follower, following).then((r: any) => r.result);
}

export const unFollow = (follower: string, following: string): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(follower),
    });

    return client.unfollow(follower, following).then((r: any) => r.result);
}

export const ignore = (follower: string, following: string): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(follower),
    });

    return client.ignore(follower, following).then((r: any) => r.result);
}

export const claimRewardBalance = (username: string, rewardHive: string, rewardHbd: string, rewardVests: string): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    return client.claimRewardBalance(
        username,
        rewardHive,
        rewardHbd,
        rewardVests
    ).then((r: any) => r.result);
}

export const transfer = (from: string, key: PrivateKey, to: string, amount: string, memo: string): Promise<TransactionConfirmation> => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });

    const args = {
        from,
        to,
        amount,
        memo
    };

    return hClient.broadcast.transfer(args, key);
}

export const transferHot = (from: string, to: string, amount: string, memo: string) => {

    const op = ['transfer', {
        from,
        to,
        amount,
        memo
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${from}/wallet`}, () => {
    });
}

export const transferToSavings = (from: string, key: PrivateKey, to: string, amount: string, memo: string): Promise<TransactionConfirmation> => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });

    const op: Operation = [
        'transfer_to_savings',
        {
            from,
            to,
            amount,
            memo
        }
    ]

    return hClient.broadcast.sendOperations([op], key);
}

export const transferToSavingsHot = (from: string, to: string, amount: string, memo: string) => {

    const op = ['transfer_to_savings', {
        from,
        to,
        amount,
        memo
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${from}/wallet`}, () => {
    }, () => {
    });
}

export const convert = (owner: string, key: PrivateKey, amount: string): Promise<TransactionConfirmation> => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });

    const op: Operation = [
        'convert',
        {
            owner,
            amount,
            requestid: new Date().getTime() >>> 0
        }
    ]

    return hClient.broadcast.sendOperations([op], key);
}

export const convertHot = (owner: string, amount: string) => {

    const op = ['convert', {
        owner,
        amount,
        requestid: new Date().getTime() >>> 0
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${owner}/wallet`}, () => {
    }, () => {
    });
}

export const transferFromSavings = (from: string, key: PrivateKey, to: string, amount: string, memo: string): Promise<TransactionConfirmation> => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });

    const op: Operation = [
        'transfer_from_savings',
        {
            from,
            to,
            amount,
            memo,
            request_id: new Date().getTime() >>> 0
        }
    ]

    return hClient.broadcast.sendOperations([op], key);
}

export const transferFromSavingsHot = (from: string, to: string, amount: string, memo: string) => {

    const op = ['transfer_from_savings', {
        from,
        to,
        amount,
        memo,
        request_id: new Date().getTime() >>> 0
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${from}/wallet`}, () => {
    }, () => {
    });
}

export const transferToVesting = (from: string, key: PrivateKey, to: string, amount: string): Promise<TransactionConfirmation> => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });

    const op: Operation = [
        'transfer_to_vesting',
        {
            from,
            to,
            amount
        }
    ]

    return hClient.broadcast.sendOperations([op], key);
}

export const transferToVestingHot = (from: string, to: string, amount: string) => {

    const op = ['transfer_to_vesting', {
        from,
        to,
        amount
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${from}/wallet`}, () => {
    }, () => {
    });
}

export const subscribe = (username: string, community: string): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    const json = JSON.stringify([
        'subscribe', {community}
    ]);

    return client.customJson([], [username], 'community', json);
}

export const unSubscribe = (username: string, community: string): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    const json = JSON.stringify([
        'unsubscribe', {community}
    ]);

    return client.customJson([], [username], 'community', json);
}
