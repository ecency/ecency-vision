import { FullAccount } from "../../../store/accounts/types";

export const getUserChatPrivateKey = (account: FullAccount): Record<string, string | undefined> => {
  if (account.posting_json_metadata) {
    const { posting_json_metadata } = account;
    const profile = JSON.parse(posting_json_metadata).profile;
    if (profile) {
      const { nsKey, nsIv } = profile || {};
      return { key: nsKey, iv: nsIv };
    }
  }
  return {};
};
