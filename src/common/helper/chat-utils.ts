import { generatePrivateKey, getPublicKey } from "nostr-tools";
import { getAccountFull } from "../api/hive";
import { updateProfile } from "../api/operations";
import { ActiveUser } from "../store/active-user/types";

export const getProfileMetaData = async (activeUser: ActiveUser | null) => {
  const response = await getAccountFull(activeUser?.username!);
  const { posting_json_metadata } = response;
  const profile = JSON.parse(posting_json_metadata!).profile;

  return profile;
};

export const setProfileMetaData = async (activeUser: ActiveUser | null, key: string) => {
  const response = await getAccountFull(activeUser?.username!);

  const { posting_json_metadata } = response;
  const profile = JSON.parse(posting_json_metadata!).profile;
  const newProfile = {
    noStrKey: key
  };

  const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
  return updatedProfile;
};

export const createNoStrAccount = () => {
  const privKey = generatePrivateKey();
  const pubKey = getPublicKey(privKey);
  return { pubKey, privKey };
};
