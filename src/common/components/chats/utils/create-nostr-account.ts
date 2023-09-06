import { generatePrivateKey, getPublicKey } from "../../../../lib/nostr-tools/keys";

export const createNoStrAccount = () => {
  const priv = generatePrivateKey();
  const pub = getPublicKey(priv);
  return { pub, priv };
};
