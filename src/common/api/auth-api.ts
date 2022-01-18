import axios from "axios";

import { apiBase } from "./helper";

export const hsTokenRenew = (
  code: string
): Promise<{
  username: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> =>
  axios
    .post(apiBase(`/auth-api/hs-token-refresh`), {
      code
    })
    .then((resp) => resp.data);
