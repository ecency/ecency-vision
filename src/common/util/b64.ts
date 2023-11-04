import { Base64 } from "js-base64";

const b64uLookup: { [key: string]: string } = {
  "/": "_",
  "_": "/",
  "+": "-",
  "-": "+",
  "=": ".",
  ".": "=",
};

export const b64uEnc = (str: string): string =>
  Base64.encode(str).replace(/(\+|\/|=)/g, (m) => b64uLookup[m]);

export const b64uDec = (str: string): any =>
  Base64.decode(str).replace(/(-|_|\.)/g, (m) => b64uLookup[m]);

  export const hexEnc = (str: string): string => {
    return str.split('').map((char) => char.charCodeAt(0).toString(16)).join('');
  };
  
  export const hexDec = (hexString: string): string => {
    return hexString.match(/.{1,2}/g)?.map((byte) => String.fromCharCode(parseInt(byte, 16))).join('') || '';
  };