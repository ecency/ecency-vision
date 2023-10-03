import { Channel } from "../../../../managers/message-manager-types";
import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";

export const setChannelMetaData = async (username: string, channel: Channel) => {
  try {
    const response = await getAccountFull(username!);
    const { posting_json_metadata } = response;
    const profile = JSON.parse(posting_json_metadata!).profile;
    const newProfile = {
      channel: channel
    };
    const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
    return updatedProfile;
  } catch (error) {
    throw error;
  }
};
