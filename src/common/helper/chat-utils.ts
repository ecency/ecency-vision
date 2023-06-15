import { useMemo } from "react";
import { generatePrivateKey, getPublicKey } from "../../lib/nostr-tools/keys";
import { Channel, DirectMessage } from "../../providers/message-provider-types";
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

export const createNoStrAccount = () => {
  const priv = generatePrivateKey();
  const pub = getPublicKey(priv);
  return { pub, priv };
};

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const GLOBAL_CHAT: Channel = {
  id: "f412192fdc846952c75058e911d37a7392aa7fd2e727330f4344badc92fb8a22",
  name: "Global Chat",
  about: "Whatever you want it to be, just be nice",
  picture: "",
  creator: "aea59833635dd0868bc7cf923926e51df936405d8e6a753b78038981c75c4a74",
  created: 1678198928
};

export const getDirectMessages = (messages: DirectMessage[], peer?: string) => {
  const clean = messages.filter((x) => x.peer === peer).sort((a, b) => a.created - b.created);

  return clean
    .map((c) => ({ ...c, children: clean.filter((x) => x.root === c.id) }))
    .filter((x) => !x.root);
};
