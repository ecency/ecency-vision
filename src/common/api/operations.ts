const hs = require("hivesigner");

import {PrivateKey, Operation, TransactionConfirmation} from '@hiveio/dhive';

import {client as hiveClient} from "./hive";

import {Account} from "../store/accounts/types";

import {usrActivity} from "./private";

import {getAccessToken} from "../helper/user-token";

import * as keychain from "../helper/keychain";

import parseAsset from "../helper/parse-asset";

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

export const formatError = (err: any): string => {
    if (err.error_description) {
        return err.error_description.substring(0, 80);
    }

    if (err.message) {
        return err.message.substring(0, 80);
    }

    return '';
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
    const args = {
        from,
        to,
        amount,
        memo
    };

    return hiveClient.broadcast.transfer(args, key);
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

export const transferKc = (from: string, to: string, amount: string, memo: string) => {
    const asset = parseAsset(amount);
    return keychain.transfer(from, to, asset.amount.toString(), memo, asset.symbol, true);
}

export const transferPoint = (from: string, key: PrivateKey, to: string, amount: string, memo: string): Promise<TransactionConfirmation> => {
    const json = JSON.stringify({
        sender: from,
        receiver: to,
        amount,
        memo
    });

    const op = {
        id: 'esteem_point_transfer',
        json,
        required_auths: [from],
        required_posting_auths: []
    };

    return hiveClient.broadcast.json(op, key);
}

export const transferPointHot = (from: string, to: string, amount: string, memo: string) => {
    const json = JSON.stringify({
        sender: from,
        receiver: to,
        amount,
        memo
    });

    const webUrl = `https://hivesigner.com/sign/custom-json?authority=active&required_auths=%5B%22${from}%22%5D&required_posting_auths=%5B%5D&id=esteem_point_transfer&json=${encodeURIComponent(
        json
    )}&redirect_uri=https://ecency.com/@${from}/points`

    const win = window.open(webUrl, '_blank');
    return win!.focus();
}

export const transferPointKc = (from: string, to: string, amount: string, memo: string) => {
    const json = JSON.stringify({
        sender: from,
        receiver: to,
        amount,
        memo
    });

    return keychain.customJson(from, "esteem_point_transfer", "Active", json, "Point Transfer")
}

export const transferToSavings = (from: string, key: PrivateKey, to: string, amount: string, memo: string): Promise<TransactionConfirmation> => {

    const op: Operation = [
        'transfer_to_savings',
        {
            from,
            to,
            amount,
            memo
        }
    ]

    return hiveClient.broadcast.sendOperations([op], key);
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

export const transferToSavingsKc = (from: string, to: string, amount: string, memo: string) => {
    const op: Operation = [
        'transfer_to_savings',
        {
            from,
            to,
            amount,
            memo
        }
    ]

    return keychain.broadcast(from, [op], "Active");
}

export const convert = (owner: string, key: PrivateKey, amount: string): Promise<TransactionConfirmation> => {
    const op: Operation = [
        'convert',
        {
            owner,
            amount,
            requestid: new Date().getTime() >>> 0
        }
    ]

    return hiveClient.broadcast.sendOperations([op], key);
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

export const convertKc = (owner: string, amount: string) => {
    const op: Operation = [
        'convert',
        {
            owner,
            amount,
            requestid: new Date().getTime() >>> 0
        }
    ]

    return keychain.broadcast(owner, [op], "Active");
}

export const transferFromSavings = (from: string, key: PrivateKey, to: string, amount: string, memo: string): Promise<TransactionConfirmation> => {
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

    return hiveClient.broadcast.sendOperations([op], key);
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

export const transferFromSavingsKc = (from: string, to: string, amount: string, memo: string) => {
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

    return keychain.broadcast(from, [op], "Active");
}

export const transferToVesting = (from: string, key: PrivateKey, to: string, amount: string): Promise<TransactionConfirmation> => {
    const op: Operation = [
        'transfer_to_vesting',
        {
            from,
            to,
            amount
        }
    ]

    return hiveClient.broadcast.sendOperations([op], key);
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

export const transferToVestingKc = (from: string, to: string, amount: string) => {
    const op: Operation = [
        'transfer_to_vesting',
        {
            from,
            to,
            amount
        }
    ]

    return keychain.broadcast(from, [op], "Active");
}

export const witnessVote = (account: string, key: PrivateKey, witness: string, approve: boolean): Promise<TransactionConfirmation> => {
    const op: Operation = [
        'account_witness_vote',
        {
            account,
            witness,
            approve
        }
    ]

    return hiveClient.broadcast.sendOperations([op], key);
}

export const witnessVoteHot = (account: string, witness: string, approve: boolean) => {
    const webUrl = `https://hivesigner.com/sign/account-witness-vote?account=${account}&witness=${witness}&approve=${approve}&redirect_uri=https://ecency.com/witnesses`

    const win = window.open(webUrl, '_blank');
    return win!.focus();
}

export const witnessVoteKc = (account: string, witness: string, approve: boolean) => {
    return keychain.witnessVote(account, witness, approve);
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

export const promote = (key: PrivateKey, user: string, author: string, permlink: string, duration: number): Promise<TransactionConfirmation> => {

    const json = JSON.stringify({
        user,
        author,
        permlink,
        duration
    });

    const op = {
        id: 'esteem_promote',
        json,
        required_auths: [user],
        required_posting_auths: []
    };

    return hiveClient.broadcast.json(op, key);
}

export const promoteHot = (user: string, author: string, permlink: string, duration: number) => {
    const json = JSON.stringify({
        user,
        author,
        permlink,
        duration
    });

    const webUrl = `https://hivesigner.com/sign/custom-json?authority=active&required_auths=%5B%22${user}%22%5D&required_posting_auths=%5B%5D&id=esteem_promote&json=${encodeURIComponent(
        json
    )}&redirect_uri=https://ecency.com/@${user}/points`

    const win = window.open(webUrl, '_blank');
    return win!.focus();
}

export const promoteKc = (user: string, author: string, permlink: string, duration: number) => {
    const json = JSON.stringify({
        user,
        author,
        permlink,
        duration
    });

    return keychain.customJson(user, "esteem_promote", "Active", json, "Promote");
}

export const boost = (key: PrivateKey, user: string, author: string, permlink: string, amount: string): Promise<TransactionConfirmation> => {
    const json = JSON.stringify({
        user,
        author,
        permlink,
        amount
    });

    const op = {
        id: 'esteem_boost',
        json,
        required_auths: [user],
        required_posting_auths: []
    };

    return hiveClient.broadcast.json(op, key);
}

export const boostHot = (user: string, author: string, permlink: string, amount: string) => {
    const json = JSON.stringify({
        user,
        author,
        permlink,
        amount
    });

    const webUrl = `https://hivesigner.com/sign/custom-json?authority=active&required_auths=%5B%22${user}%22%5D&required_posting_auths=%5B%5D&id=esteem_boost&json=${encodeURIComponent(
        json
    )}&redirect_uri=https://ecency.com/@${user}/points`

    const win = window.open(webUrl, '_blank');
    return win!.focus();
}

export const boostKc = (user: string, author: string, permlink: string, amount: string) => {
    const json = JSON.stringify({
        user,
        author,
        permlink,
        amount
    });

    return keychain.customJson(user, "esteem_boost", "Active", json, "Boost");
}

export const updateProfile = (account: Account, newProfile: {
    name: string,
    about: string,
    website: string,
    location: string,
    cover_image: string,
    profile_image: string,
}): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(account.name)
    });

    const params = {
        account: account.name,
        json_metadata: '',
        posting_json_metadata: JSON.stringify({profile: {...newProfile, version: 2}}),
        extensions: []
    };

    const opArray = [["account_update2", params]];

    return client.broadcast(opArray).then((r: any) => r.result)
}

export const grantPostingPermission = (key: PrivateKey, account: Account, pAccount: string) => {
    if (account.posting === undefined || account.memo_key === undefined || account.json_metadata === undefined) {
        throw "posting|memo_key|json_metadata required with account instance";
    }

    const newPosting = Object.assign(
        {},
        {...account.posting},
        {
            account_auths: [
                ...account.posting.account_auths,
                [pAccount, account.posting.weight_threshold]
            ]
        }
    );

    // important!
    newPosting.account_auths.sort((a, b) => (a[0] > b[0] ? 1 : -1));

    return hiveClient.broadcast.updateAccount({
        account: account.name,
        posting: newPosting,
        active: undefined,
        memo_key: account.memo_key,
        json_metadata: account.json_metadata
    }, key);
};

export const revokePostingPermission = (key: PrivateKey, account: Account, pAccount: string) => {
    if (account.posting === undefined || account.memo_key === undefined || account.json_metadata === undefined) {
        throw "posting|memo_key|json_metadata required with account instance";
    }

    const newPosting = Object.assign(
        {},
        {...account.posting},
        {
            account_auths: account.posting.account_auths.filter(x => x[0] !== pAccount)
        }
    );

    return hiveClient.broadcast.updateAccount(
        {
            account: account.name,
            posting: newPosting,
            memo_key: account.memo_key,
            json_metadata: account.json_metadata
        },
        key
    );
};

export const setUserRole = (username: string, community: string, account: string, role: string): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    const json = JSON.stringify([
        'setRole', {community, account, role}
    ]);

    return client.customJson([], [username], 'community', json);
}

export const updateCommunity = (username: string, community: string, props: { title: string, about: string, lang: string, description: string, flag_text: string, is_nsfw: boolean }): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    const json = JSON.stringify([
        'updateProps', {community, props}
    ]);

    return client.customJson([], [username], 'community', json);
}

export const pinPost = (username: string, community: string, account: string, permlink: string, pin: boolean): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    const json = JSON.stringify([
        pin ? 'pinPost' : 'unpinPost', {community, account, permlink}
    ]);

    return client.customJson([], [username], 'community', json);
}

export const mutePost = (username: string, community: string, account: string, permlink: string, notes: string, mute: boolean): Promise<TransactionConfirmation> => {
    const client = new hs.Client({
        accessToken: getAccessToken(username),
    });

    const json = JSON.stringify([
        mute ? 'mutePost' : 'unmutePost', {community, account, permlink, notes}
    ]);

    return client.customJson([], [username], 'community', json);
}
