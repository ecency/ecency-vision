import { FullAccount } from "../../../store/accounts/types";

export const getUserChatPrivateKey = (account: FullAccount): Record<string, string | undefined> => {
  if (account.posting_json_metadata) {
    const { posting_json_metadata } = account;
    const profile = JSON.parse(posting_json_metadata).profile;
    if (profile?.echat) {
      const {
        echat: { key, iv }
      } = profile || { echat: {} };
      return { key, iv };
    }
  }
  return {};
};
