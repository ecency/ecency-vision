import { MutationKey, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Event } from "../../../../lib/nostr-tools/event";
import { listenWhileFinish } from "./utils";
import { useContext } from "react";
import { NostrContext } from "./nostr-context";
import { ChatContext } from "../chat-context-provider";
import { Filter } from "../../../../lib/nostr-tools/filter";

export function useNostrFetchMutation(
  key: MutationKey,
  filters: Filter[],
  options?: UseMutationOptions<Event[], Error>
) {
  const { pool, readRelays } = useContext(NostrContext);
  const { activeUserKeys } = useContext(ChatContext);

  return useMutation(
    key,
    () => listenWhileFinish(pool, readRelays, [], activeUserKeys.pub, filters),
    options
  );
}
