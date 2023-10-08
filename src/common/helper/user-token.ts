import { setActiveUser } from "../store/active-user";
import { User } from "../store/users/types";
import { decodeObj } from "../util/encoder";
import * as ls from "../util/local-storage";

export const getUser = (username: string): User | undefined => {
  const raw = ls.get(`user_${username}`);
  if (!raw) {
    console.log("User does not exist!");
    setActiveUser(null);
    return undefined;
  }

  try {
    return decodeObj(raw) as User;
  } catch (e) {
    console.log("User does not exist!");
    setActiveUser(null);
    return decodeObj(username) as User;
  }
};

export const getAccessToken = (username: string): string | undefined =>
  getUser(username) && getUser(username)!.accessToken;

export const getPostingKey = (username: string): null | undefined | string =>
  getUser(username) && getUser(username)!.postingKey;

export const getRefreshToken = (username: string): string | undefined =>
  getUser(username) && getUser(username)!.refreshToken;
