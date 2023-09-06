import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";
import { ActiveUser } from "../../../store/active-user/types";
import { getProfileMetaData } from "./fetch-profile-metadata";
import * as ls from "../../../util/local-storage";

export const deleteChatPublicKey = (activeUser: ActiveUser | null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const profile = await getProfileMetaData(activeUser?.username!);
      delete profile.nsKey;
      delete profile.channel;
      ls.remove(`${activeUser?.username}_nsPrivKey`);
      const response = await getAccountFull(activeUser?.username!);
      const updatedProfile = await updateProfile(response, { ...profile });
      console.log("Updated profile", updatedProfile);
      resolve(updatedProfile);
    } catch (error) {
      reject(error);
    }
  });
};
