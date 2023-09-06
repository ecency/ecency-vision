import { getAccountFull } from "../../../api/hive";

export const getUserChatPublicKey = async (username: string) => {
  const response = await getAccountFull(username);
  const { posting_json_metadata } = response;
  const profile = JSON.parse(posting_json_metadata!).profile;
  const { nsKey } = profile || {};
  console.log("nsKey", nsKey);
  return nsKey;
};
