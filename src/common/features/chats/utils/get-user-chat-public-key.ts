import { FullAccount } from "../../../store/accounts/types";

export const getUserChatPublicKey = (account: FullAccount): string | undefined => {
  if (account.posting_json_metadata) {
    const { posting_json_metadata } = account;
    const profile = JSON.parse(posting_json_metadata).profile;
    if (profile) {
      const { nsPubKey } = profile || {};
      return nsPubKey;
    }
  }
  return undefined;
};
