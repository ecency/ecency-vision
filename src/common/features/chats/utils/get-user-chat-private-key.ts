import { getAccountFull } from "../../../api/hive";

export const getUserChatPrivateKey = async (
  username: string
): Promise<Record<string, string | undefined>> => {
  const response = await getAccountFull(username);
  if (response && response.posting_json_metadata) {
    const { posting_json_metadata } = response;
    const profile = JSON.parse(posting_json_metadata).profile;
    if (profile) {
      const { nsKey, nsIv } = profile || {};
      return { key: nsKey, iv: nsIv };
    }
  }
  return {};
};
