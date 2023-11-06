import { createContext } from "react";
import SimplePool from "../../../../lib/nostr-tools/pool";

export const NostrContext = createContext<{
  pool: SimplePool | undefined;
  readRelays: string[];
  writeRelays: string[];
}>({
  pool: undefined,
  writeRelays: [],
  readRelays: []
});
