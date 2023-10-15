import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";
import { ActiveUser } from "../../../store/active-user/types";

export const uploadChatPublicKey = async (activeUser: ActiveUser | null, noStrPubKey: string) => {
  const response = await getAccountFull(activeUser?.username!);

  debugger;
  return await updateProfile(response, {
    ...JSON.parse(response?.posting_json_metadata ? response.posting_json_metadata : "{}"),
    nsKey: noStrPubKey
  });
};
