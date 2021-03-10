import {User} from "../store/users/types";

import {decodeObj} from "../util/encoder";

import * as ls from "../util/local-storage";

export const getUser = (username: string): User => {
    const raw = ls.get(`user_${username}`);
    if (!raw) {
        throw "User is not exists!";
    }

    try {
        return decodeObj(raw) as User;
    } catch (e) {
        throw "User is not exists!";
    }
}

export const getAccessToken = (username: string): string => getUser(username).accessToken;

export const getPostingKey = (username: string): null | undefined | string => getUser(username).postingKey;

export const getRefreshToken = (username: string): string => getUser(username).refreshToken;

