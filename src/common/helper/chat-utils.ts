import moment from "moment";
import { generatePrivateKey, getPublicKey } from "../../lib/nostr-tools/keys";
import { Channel } from "../../providers/message-provider-types";
import { getAccountFull } from "../api/hive";
import { updateProfile } from "../api/operations";
import { ActiveUser } from "../store/active-user/types";
import * as ls from "../util/local-storage";

export interface NostrKeysType {
  pub: string;
  priv: string;
}

export const getProfileMetaData = async (username: string) => {
  const response = await getAccountFull(username);
  const { posting_json_metadata } = response;
  if (posting_json_metadata) {
    const profile = JSON.parse(posting_json_metadata!).profile;

    return profile;
  }
};

export const resetProfile = (activeUser: ActiveUser | null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const profile = await getProfileMetaData(activeUser?.username!);
      delete profile.noStrKey;
      delete profile.channel;
      ls.remove(`${activeUser?.username}_noStrPrivKey`);
      const response = await getAccountFull(activeUser?.username!);
      const updatedProfile = await updateProfile(response, { ...profile });
      console.log("Updated profile", updatedProfile);
      resolve(updatedProfile);
    } catch (error) {
      reject(error);
    }
  });
};

export const setProfileMetaData = async (activeUser: ActiveUser | null, noStrPubKey: string) => {
  const response = await getAccountFull(activeUser?.username!);

  const { posting_json_metadata } = response;
  const profile = JSON.parse(posting_json_metadata!).profile;
  const newProfile = {
    noStrKey: noStrPubKey
  };

  const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
  return updatedProfile;
};

export const setChannelMetaData = (username: string, channel: Channel) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await getAccountFull(username!);
      const { posting_json_metadata } = response;
      const profile = JSON.parse(posting_json_metadata!).profile;
      const newProfile = {
        channel: channel
      };
      const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
      resolve(updatedProfile);
    } catch (error) {
      reject(error);
    }
  });
};

export const createNoStrAccount = () => {
  const priv = generatePrivateKey();
  const pub = getPublicKey(priv);
  return { pub, priv };
};

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const formatMessageTime = (unixTs: number) => moment.unix(unixTs).format("h:mm a");

export const formatMessageDate = (unixTs: number) => moment.unix(unixTs).format("dddd, MMMM Do");

export const isSha256 = (s: string) => /^[a-f0-9]{64}$/gi.test(s);

export const getCommunities = (channels: Channel[], leftChannels: string[]) => {
  return channels.filter((item) => !leftChannels.includes(item.id));
};

export const getPrivateKey = (username: string) => {
  return ls.get(`${username}_noStrPrivKey`);
};
