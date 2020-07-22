import axios from "axios";

import {User} from "../store/users/types";

export interface ReceivedVestingShare {
    delegatee: string;
    delegator: string;
    timestamp: string;
    vesting_shares: string;
}

export const getReceivedVestingShares = (username: string): Promise<ReceivedVestingShare[]> =>
    axios.get(`/api/received-vesting/${username}`).then((resp) => resp.data.list);

export const hsTokenRenew = (code: string): Promise<{
    username: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}> =>
    axios
        .post(`/api/hs-token-refresh`, {
            code,
        })
        .then((resp) => resp.data);


export const signUp = (username: string, email: string, referral: string): Promise<any> =>
    axios
        .post(`/api/account-create`, {
            username: username,
            email: email,
            referral: referral
        })
        .then(resp => {
            return resp;
        });


export const usrActivity = (user: User, ty: number, bl: string | number = '', tx: string | number = '') => {
    const params: {
        code: string;
        ty: number;
        bl?: string | number;
        tx?: string | number;
    } = {code: user.accessToken, ty};

    if (bl) params.bl = bl;
    if (tx) params.tx = tx;

    return axios.post(`/api/usr-activity`, params);
};
