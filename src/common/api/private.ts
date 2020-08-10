import axios from "axios";

import {User} from "../store/users/types";

import {ApiNotification, NotificationFilter} from "../store/notifications/types";

import {getAccessToken} from "../helper/user-token";

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


export const usrActivity = (username: string, ty: number, bl: string | number = '', tx: string | number = '') => {
    const params: {
        code: string;
        ty: number;
        bl?: string | number;
        tx?: string | number;
    } = {code: getAccessToken(username), ty};

    if (bl) params.bl = bl;
    if (tx) params.tx = tx;

    return axios.post(`/api/usr-activity`, params);
};

export const getNotifications = (username: string, filter: NotificationFilter | null, since: string | null = null): Promise<ApiNotification[]> => {

    const data: { code: string; filter?: string, since?: string } = {code: getAccessToken(username)};

    if (filter) {
        data.filter = filter;
    }

    if (since) {
        data.since = since;
    }

    return axios.post(`/api/notifications`, data).then(resp => resp.data);
};

export const getUnreadNotificationCount = (username: string): Promise<number> => {
    const data = {code: getAccessToken(username)};

    return axios
        .post(`/api/notifications/unread`, data)
        .then(resp => resp.data.count);
}


export const markNotifications = (username: string, id: string | null = null) => {
    const data: { code: string; id?: string } = {code: getAccessToken(username)}
    if (id) {
        data.id = id;
    }

    return axios.post(`/api/notifications/mark`, data);
};


export interface GalleryItem {
    created: string
    timestamp: number
    url: string
    _id: string
}

export const getImages = (username: string): Promise<GalleryItem[]> => {
    const data = {code: getAccessToken(username)};
    return axios.post(`/api/images`, data).then(resp => resp.data);
}

export const deleteImage = (username: string, imageID: string): Promise<any> => {
    const data = {code: getAccessToken(username), id: imageID};
    return axios.post(`/api/images-delete`, data).then(resp => resp.data);
}

export const addImage = (username: string, url: string): Promise<any> => {
    const data = {code: getAccessToken(username), url: url};
    return axios.post(`/api/images-add`, data).then(resp => resp.data);
}

export interface Draft {
    body: string
    created: string
    post_type: string
    tags: string
    timestamp: number
    title: string
    _id: string
}

export const getDrafts = (username: string): Promise<Draft[]> => {
    const data = {code: getAccessToken(username)};
    return axios.post(`/api/drafts`, data).then(resp => resp.data);
}

export const deleteDraft = (username: string, draftId: string): Promise<any> => {
    const data = {code: getAccessToken(username), id: draftId};
    return axios.post(`/api/drafts-delete`, data).then(resp => resp.data);
}
