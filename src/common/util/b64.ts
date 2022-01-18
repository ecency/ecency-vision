const b64uLookup = { "/": "_", _: "/", "+": "-", "-": "+", "=": ".", ".": "=" };

export const b64uEnc = (str: string): string =>
  btoa(str).replace(/([+\/=])/g, (m) => b64uLookup[m]);
