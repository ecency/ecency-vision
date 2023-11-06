import { useContext } from "react";
import { NostrContext } from "../nostr-context";
import { useMutation } from "@tanstack/react-query";

export function useFindHealthyRelayQuery() {
  const { pool } = useContext(NostrContext);

  return useMutation(["chats/nostr-find-healthy-relay"], async (channelId: string) => {
    const relays = (pool?.seenOn(channelId) as string[]) ?? [];
    for (const relay of relays) {
      try {
        await pool?.ensureRelay(relay);
        return relay;
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  });
}
