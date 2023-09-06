import { Channel } from "../../../../providers/message-provider-types";
import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";

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
