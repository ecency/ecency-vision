import { apiBase } from "./helper";
import { appAxios } from "@/api/axios";

export const hsTokenRenew = (
  code: string
): Promise<{
  username: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> =>
  appAxios
    .post(apiBase(`/auth-api/hs-token-refresh`), {
      code
    })
    .then((resp) => resp.data);
