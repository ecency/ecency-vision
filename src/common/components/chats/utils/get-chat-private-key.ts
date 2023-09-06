import * as ls from "../../../util/local-storage";

export const getPrivateKey = (username: string) => {
  return ls.get(`${username}_nsPrivKey`);
};
