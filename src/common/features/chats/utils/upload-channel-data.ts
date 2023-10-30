import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";
import { Channel } from "../managers/message-manager-types";

export const setChannelMetaData = async (username: string, channel: Channel) => {
  try {
    const response = await getAccountFull(username!);
    const { posting_json_metadata } = response;
    const profile = JSON.parse(posting_json_metadata!).profile;
    const newProfile = {
      channel: channel
    };
    return await updateProfile(response, { ...profile, ...newProfile });
  } catch (error) {
    throw error;
  }
};
