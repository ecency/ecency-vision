import {User} from "../store/users/types";

import {decodeObj} from "../util/encoder";

import * as ls from "../util/local-storage";

export const getAccessToken = (username: string): string => {
    const raw = ls.get(`user_${username}`);
    if (!raw) {
        throw "User is not exists!";
    }

    try {
        const user: User = decodeObj(raw) as User;
        return user.accessToken;
    } catch (e) {
        throw "User is not exists!";
    }
}
