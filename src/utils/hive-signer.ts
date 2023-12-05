import hs from "hivesigner";

import { b64uEnc } from "./b64";
import { getAccessToken } from "./user-token";
import { HiveSignerMessage } from "@/types";

export function getAuthUrl(app: string, redir: string = `${window.location.origin}/auth`) {
  const scope =
    "vote,comment,delete_comment,comment_options,custom_json,claim_reward_balance,offline";

  return `https://hivesigner.com/oauth2/authorize?client_id=${app}&redirect_uri=${encodeURIComponent(
    redir
  )}&response_type=code&scope=${encodeURIComponent(scope)}`;
}

export function getTokenUrl(code: string, secret: string) {
  return `https://hivesigner.com/api/oauth2/token?code=${code}&client_secret=${secret}`;
}

export function getDecodedMemo(username: string, memo: string): Promise<any> {
  // With hivesigner access token
  let token = getAccessToken(username);
  return token
    ? new hs.Client({
        accessToken: token
      })
        .decode(memo)
        .then((r: any) => r)
    : Promise.resolve(0);
}

export function decodeToken(code: string): HiveSignerMessage | null {
  const buff = new Buffer(code, "base64");
  try {
    const s = buff.toString("ascii");
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

export function validateToken(code: string): boolean {
  const dt = decodeToken(code);
  const sevenDaysAgo: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (dt) {
    if (new Date(dt.timestamp * 1000) > sevenDaysAgo) {
      return true;
    }
  }
  return false;
}

export async function makeHsCode(
  hsClientId: string,
  account: string,
  signer: (message: string) => Promise<string>
): Promise<string> {
  const timestamp = new Date().getTime() / 1000;

  const messageObj: HiveSignerMessage = {
    signed_message: { type: "code", app: hsClientId },
    authors: [account],
    timestamp
  };

  const message = JSON.stringify(messageObj);

  const signature = await signer(message);

  messageObj.signatures = [signature];

  return b64uEnc(JSON.stringify(messageObj));
}

export function buildHotSignUrl(
  endpoint: string,
  params: {
    [key: string]: string;
  },
  redirect: string
): any {
  const _params = {
    ...params,
    redirect_uri: `https://ecency.com/${redirect}`
  };

  const queryString = new URLSearchParams(_params).toString();
  return `https://hivesigner.com/sign/${endpoint}?${queryString}`;
}

export function hotSign(
  endpoint: string,
  params: {
    [key: string]: any;
  },
  redirect: string
) {
  const webUrl = buildHotSignUrl(endpoint, params, redirect);
  const win = window.open(webUrl, "_blank");
  return win!.focus();
}
