import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";
import { ActiveUser } from "../../../store/active-user/types";

export const uploadChatPublicKey = async (activeUser: ActiveUser | null, noStrPubKey: string) => {
  const response = await getAccountFull(activeUser?.username!);

  const { posting_json_metadata } = response;

  const newProfile = {
    nsKey: noStrPubKey
  };

  if (!response || !response.posting_json_metadata) {
    const newPostingData = {
      posting_json_metadata: JSON.stringify({ profile: {} })
    };
    const profile = JSON.parse(newPostingData.posting_json_metadata)?.profile;
    const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
    return updatedProfile;
  }

  const profile = JSON.parse(posting_json_metadata!)?.profile;
  const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
  return updatedProfile;
};
