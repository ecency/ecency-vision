import * as ls from "./local-storage";
import { User } from "@/entities";
import { decodeObj } from "@/utils/encoder";

export const getUser = (
  username: string,
  setActiveUser?: (value: null) => void
): User | undefined => {
  const raw = ls.get(`user_${username}`);
  if (!raw) {
    console.log("User does not exist!");
    setActiveUser?.(null);
    return undefined;
  }

  try {
    return decodeObj(raw) as User;
  } catch (e) {
    console.log("User does not exist!");
    setActiveUser?.(null);
    return decodeObj(username) as User;
  }
};

export const getAccessToken = (username: string): string | undefined =>
  getUser(username) && getUser(username)!.accessToken;

export const getPostingKey = (username: string): null | undefined | string =>
  getUser(username) && getUser(username)!.postingKey;

export const getRefreshToken = (username: string): string | undefined =>
  getUser(username) && getUser(username)!.refreshToken;
