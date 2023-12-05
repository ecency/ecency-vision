import { Base64 } from "js-base64";

const b64uLookup = { "/": "_", _: "/", "+": "-", "-": "+", "=": ".", ".": "=" };

export const b64uEnc = (str: string): string =>
  Base64.encode(str).replace(/(\+|\/|=)/g, (m: keyof typeof b64uLookup) => b64uLookup[m]);

export const b64uDec = (str: string): any =>
  Base64.decode(str).replace(/(-|_|\.)/g, (m: keyof typeof b64uLookup) => b64uLookup[m]);
