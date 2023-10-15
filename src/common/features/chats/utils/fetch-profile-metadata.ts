import { getAccountFull } from "../../../api/hive";

export const getProfileMetaData = async (username: string) => {
  const response = await getAccountFull(username);
  const { posting_json_metadata } = response;
  if (posting_json_metadata) {
    return JSON.parse(posting_json_metadata!).profile;
  }
};
