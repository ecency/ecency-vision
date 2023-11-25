import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";
import { ActiveUser } from "../../../store/active-user/types";
import { createNoStrAccount } from "./create-nostr-account";

export const uploadChatKeys = async (
  activeUser: ActiveUser | null,
  { pub, priv, iv }: ReturnType<typeof createNoStrAccount> & { iv: Buffer }
) => {
  const response = await getAccountFull(activeUser?.username!);

  return await updateProfile(response, {
    ...JSON.parse(response?.posting_json_metadata ? response.posting_json_metadata : "{}").profile,
    echat: {
      pubKey: pub,
      iv: iv.toString("base64"),
      key: priv
    }
  });
};
