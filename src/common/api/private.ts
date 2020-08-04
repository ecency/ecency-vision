import axios from "axios";

import {User} from "../store/users/types";
import {ApiNotification, NotificationFilter} from "../store/notifications/types";

export interface ReceivedVestingShare {
    delegatee: string;
    delegator: string;
    timestamp: string;
    vesting_shares: string;
}

export const getReceivedVestingShares = (username: string): Promise<ReceivedVestingShare[]> =>
    axios.get(`/api/received-vesting/${username}`).then((resp) => resp.data.list);


export interface PopularUser {
    name: string,
    display_name: string,
    about: string,
    reputation: number
}

export const getPopularUsers = (): Promise<PopularUser[]> =>
    axios.get(`/api/popular-users`).then((resp) => resp.data);

export interface LeaderBoardItem {
    _id: string;
    count: number;
    points: string
}

export type LeaderBoardDuration = "day" | "week" | "month";

export const getLeaderboard = (duration: LeaderBoardDuration): Promise<LeaderBoardItem[]> => {
    return axios.post(`/api/leaderboard`, {duration}).then(resp => resp.data);
};

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

export const getNotifications = (user: User, filter: NotificationFilter | null, since: string | null = null): Promise<ApiNotification[]> => {
    const data: { code: string; filter?: string, since?: string } = {code: user.accessToken};

    if (filter) {
        data.filter = filter;
    }

    if (since) {
        data.since = since;
    }

    return axios.post(`/api/notifications`, data).then(resp => resp.data);
};

export const getUnreadNotificationCount = (user: User): Promise<number> => {
    const data: { code: string; } = {code: user.accessToken};

    return axios
        .post(`/api/notifications/unread`, data)
        .then(resp => resp.data.count);
}


export const markNotifications = (user: User, id: string | null = null) => {
    const data: { code: string; id?: string } = {code: user.accessToken}
    if (id) {
        data.id = id;
    }

    return axios.post(`/api/notifications/mark`, data);
};
