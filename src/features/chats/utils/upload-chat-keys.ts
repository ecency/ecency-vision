import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";
import { AccountData, createNoStrAccount } from "@ecency/ns-query";

export const uploadChatKeys = async (
  activeUser: AccountData,
  { pub, priv, iv }: ReturnType<typeof createNoStrAccount> & { iv: Buffer }
) => {
  const response = await getAccountFull(activeUser?.name!);

  return await updateProfile(response, {
    ...JSON.parse(response?.posting_json_metadata ? response.posting_json_metadata : "{}").profile,
    echat: {
      pubKey: pub,
      iv: iv.toString("base64"),
      key: priv
    }
  });
};
