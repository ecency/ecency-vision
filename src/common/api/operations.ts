const hs = require("hivesigner");

import {Client as HiveClient, PrivateKey, Operation} from '@hiveio/dhive';

import SERVERS from "../constants/servers.json";

export interface MetaData {
    links?: string[];
    images?: string[];
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

import {User} from "../store/users/types";

export const formatError = (err: any) => {
    if (err.error_description) {
        return err.error_description.substring(0, 80);
    }
};

export const reblog = (user: User, author: string, permlink: string): Promise<any> => {
    const client = new hs.Client({
        accessToken: user.accessToken,
    });

    return client.reblog(user.username, author, permlink);
};

export const comment = (
    user: User,
    parentAuthor: string,
    parentPermlink: string,
    permlink: string,
    title: string,
    body: string,
    jsonMetadata: MetaData,
    options: CommentOptions | null
): Promise<any> => {
    const {username: author} = user;

    const client = new hs.Client({
        accessToken: user.accessToken,
    });

    const params = {
        parent_author: parentAuthor,
        parent_permlink: parentPermlink,
        author,
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

    return client.broadcast(opArray);
};

export const deleteComment = (user: User, author: string, permlink: string): Promise<any> => {
    const client = new hs.Client({
        accessToken: user.accessToken,
    });

    const params = {
        author,
        permlink,
    };

    const opArray = [["delete_comment", params]];

    return client.broadcast(opArray);
};

export const vote = (user: User, author: string, permlink: string, weight: number): Promise<any> => {
    const client = new hs.Client({
        accessToken: user.accessToken,
    });

    const voter = user.username;

    return client.vote(voter, author, permlink, weight);
};

export const follow = (user: User, following: string): Promise<any> => {
    const client = new hs.Client({
        accessToken: user.accessToken,
    });

    const follower = user.username;

    return client.follow(follower, following);
}

export const unFollow = (user: User, following: string): Promise<any> => {
    const client = new hs.Client({
        accessToken: user.accessToken,
    });

    const follower = user.username;

    return client.unfollow(follower, following);
}

export const ignore = (user: User, following: string): Promise<any> => {
    const client = new hs.Client({
        accessToken: user.accessToken,
    });

    const follower = user.username;

    return client.ignore(follower, following);
}

export const claimRewardBalance = (user: User, rewardHive: string, rewardHbd: string, rewardVests: string): Promise<any> => {
    const client = new hs.Client({
        accessToken: user.accessToken,
    });

    return client.claimRewardBalance(
        user.username,
        rewardHive,
        rewardHbd,
        rewardVests
    );
}

export const transfer = (user: User, key: PrivateKey, to: string, amount: string, memo: string): Promise<any> => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });
    const from = user.username;

    const args = {
        from,
        to,
        amount,
        memo
    };

    return hClient.broadcast.transfer(args, key);
}

export const transferHot = (user: User, to: string, amount: string, memo: string) => {
    const from = user.username;

    const op = ['transfer', {
        from,
        to,
        amount,
        memo
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${user.username}/wallet`}, () => {
    });
}

export const transferToSavings = (user: User, key: PrivateKey, to: string, amount: string, memo: string) => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });
    const from = user.username;

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

export const transferToSavingsHot = (user: User, to: string, amount: string, memo: string) => {
    const from = user.username;

    const op = ['transfer_to_savings', {
        from,
        to,
        amount,
        memo
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${user.username}/wallet`}, () => {
    }, () => {
    });
}

export const convert = (user: User, key: PrivateKey, amount: string) => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });
    const owner = user.username;

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

export const convertHot = (user: User, amount: string) => {
    const owner = user.username;

    const op = ['convert', {
        owner,
        amount,
        requestid: new Date().getTime() >>> 0
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${user.username}/wallet`}, () => {
    }, () => {
    });
}

export const transferFromSavings = (user: User, key: PrivateKey, to: string, amount: string, memo: string) => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });
    const from = user.username;

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

export const transferFromSavingsHot = (user: User, to: string, amount: string, memo: string) => {
    const from = user.username;

    const op = ['transfer_from_savings', {
        from,
        to,
        amount,
        memo,
        request_id: new Date().getTime() >>> 0
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${user.username}/wallet`}, () => {
    }, () => {
    });
}

export const transferToVesting = (user: User, key: PrivateKey, to: string, amount: string) => {
    const hClient = new HiveClient(SERVERS);
    hClient.database.getVersion().then((res: any) => {
        if (res.blockchain_version !== '0.23.0') {
            // true: eclipse rebranded rpc nodes
            // false: default old nodes (not necessary to call for old nodes)
            hClient.updateOperations(true)
        }
    });
    const from = user.username;

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

export const transferToVestingHot = (user: User, to: string, amount: string) => {
    const from = user.username;

    const op = ['transfer_to_vesting', {
        from,
        to,
        amount
    }];

    return hs.sendOperation(op, {callback: `https://ecency.com/@${user.username}/wallet`}, () => {
    }, () => {
    });
}
