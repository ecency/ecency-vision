const hs = require("hivesigner");

import { User } from "../store/users/types";

export const reblog = (user: User, author: string, permlink: string): Promise<any> => {
  var client = new hs.Client({
    accessToken: user.accessToken,
  });

  return client.reblog(user.username, author, permlink);
};
