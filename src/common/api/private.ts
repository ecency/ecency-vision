import axios from "axios";

import {User} from "../store/users/types";
import {Notification as NotificationType, NotificationFilter} from "../store/notifications/types";

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

export const getNotifications = (username: string, filter: NotificationFilter | null, since: number | null = null): Promise<NotificationType[]> => {
    let u = new URL(`/api/notifications/${username}`);

    if (filter) {
        u.searchParams.append("filter", filter);
    }

    if (since) {
        u.searchParams.append("since", String(since));
    }

    return axios.get(u.href).then(resp => resp.data);
};

export const getUnreadNotificationCount = (username: string): Promise<number> =>
    axios
        .get(`/api/activities/${username}/unread-count`)
        .then(resp => resp.data.count);
