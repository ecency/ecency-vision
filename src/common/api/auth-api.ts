import axios from "axios";

import {_u} from "./private-api";

export const hsTokenRenew = (code: string): Promise<{
    username: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}> =>
    axios
        .post(_u(`/api/hs-token-refresh`), {
            code,
        })
        .then((resp) => resp.data);

