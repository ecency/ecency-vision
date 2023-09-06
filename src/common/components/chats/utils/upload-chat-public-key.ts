import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";
import { ActiveUser } from "../../../store/active-user/types";

export const setProfileMetaData = async (activeUser: ActiveUser | null, noStrPubKey: string) => {
  const response = await getAccountFull(activeUser?.username!);

  const { posting_json_metadata } = response;
  const profile = JSON.parse(posting_json_metadata!).profile;
  const newProfile = {
    nsKey: noStrPubKey
  };

  const updatedProfile = await updateProfile(response, { ...profile, ...newProfile });
  return updatedProfile;
};
