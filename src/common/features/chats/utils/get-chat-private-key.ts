import * as ls from "../../../util/local-storage";

export const getPrivateKey = (username: string): string | null => {
  return ls.get(`${username}_nsPrivKey`) ?? null;
};
