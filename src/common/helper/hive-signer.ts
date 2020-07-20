import config from "../../config";

export const getAuthUrl = () => {
    const app = config.masterAccount;
    const scope = "vote,comment,delete_comment,comment_options,custom_json,claim_reward_balance,offline";
    const redir = `${window.location.origin}/auth`;

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
