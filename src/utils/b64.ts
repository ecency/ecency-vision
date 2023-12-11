import { Base64 } from "js-base64";

const b64uLookup: Record<string, any> = {
  "/": "_",
  _: "/",
  "+": "-",
  "-": "+",
  "=": ".",
  ".": "="
};

export const b64uEnc = (str: string): string =>
  Base64.encode(str).replace(/(\+|\/|=)/g, (m) => b64uLookup[m]);

export const b64uDec = (str: string): any =>
  Base64.decode(str).replace(/(-|_|\.)/g, (m) => b64uLookup[m]);
