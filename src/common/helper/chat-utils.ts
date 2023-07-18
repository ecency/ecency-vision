import moment from "moment";
import { generatePrivateKey, getPublicKey } from "../../lib/nostr-tools/keys";
import { Channel } from "../../providers/message-provider-types";
import { getAccountFull } from "../api/hive";
import { updateProfile } from "../api/operations";
import { ActiveUser } from "../store/active-user/types";

export interface NostrKeys {
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

export const resetProfile = async (activeUser: ActiveUser | null) => {
  const profile = await getProfileMetaData(activeUser?.username!);
  delete profile.noStrKey;
  delete profile.profile;
  delete profile.version;
  const response = await getAccountFull(activeUser?.username!);
  const profileC = {
    name: activeUser?.username,
    about: "",
    cover_image: "",
    profile_image: "",
    website: "",
    location: "",
    pinned: "",
    version: 2
  };
  const updatedProfile = await updateProfile(response, { ...profileC });
  console.log(updatedProfile);
};

export const setProfileMetaData = async (activeUser: ActiveUser | null, keys: NostrKeys) => {
  const response = await getAccountFull(activeUser?.username!);

  const { posting_json_metadata } = response;
  const profile = JSON.parse(posting_json_metadata!).profile;
  const newProfile = {
    noStrKey: keys
  };

  const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
  return updatedProfile;
};

export const setChannelMetaData = async (username: string, channel: Channel) => {
  const response = await getAccountFull(username!);
  const { posting_json_metadata } = response;
  const profile = JSON.parse(posting_json_metadata!).profile;
  const newProfile = {
    channel: channel
  };
  console.log({ ...profile, ...newProfile });
  const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
  return updatedProfile;
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
