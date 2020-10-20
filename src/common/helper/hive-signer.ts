import {cryptoUtils, PrivateKey} from "@hiveio/dhive";

import {b64uEnc} from "../util/b64";

export const getAuthUrl = (redir: string = `${window.location.origin}/auth`) => {
    const app = "ecency.app";
    const scope = "vote,comment,delete_comment,comment_options,custom_json,claim_reward_balance,offline";

    return `https://hivesigner.com/oauth2/authorize?client_id=${app}&redirect_uri=${encodeURIComponent(
        redir
    )}&response_type=code&scope=${encodeURIComponent(scope)}`;
};

export const getTokenUrl = (code: string, secret: string) => {
    return `https://hivesigner.com/api/oauth2/token?code=${code}&client_secret=${secret}`;
};

export const decodeToken = (code: string): {
    signed_message: {
        type: string;
        app: string
    },
    authors: string[],
    timestamp: number,
    signatures: string[];
} | null => {
    const buff = new Buffer(code, "base64");
    try {
        const s = buff.toString("ascii");
        return JSON.parse(s);
    } catch (e) {
        return null;
    }
}

export const makeHsCode = (account: string, privateKey: PrivateKey): string => {
    const timestamp = new Date().getTime() / 1000;

    const messageObj: {
        signed_message: {
            type: string;
            app: string;
        },
        authors: string[];
        timestamp: number;
        signatures?: string[];
    } = {signed_message: {type: 'code', app: "ecency.app"}, authors: [account], timestamp};

    const hash = cryptoUtils.sha256(JSON.stringify(messageObj));
    const signature = privateKey.sign(hash).toString();
    messageObj.signatures = [signature];

    return b64uEnc(JSON.stringify(messageObj));
}
