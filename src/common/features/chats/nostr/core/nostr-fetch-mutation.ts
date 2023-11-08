import { MutationKey, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useContext } from "react";
import { NostrContext } from "../nostr-context";
import { listenWhileFinish } from "../utils";
import { Event } from "../../../../../lib/nostr-tools/event";
import { Filter } from "../../../../../lib/nostr-tools/filter";
import { useKeysQuery } from "../../queries/keys-query";

export function useNostrFetchMutation(
  key: MutationKey,
  filters: Filter[],
  options?: UseMutationOptions<Event[], Error>
) {
  const { pool, readRelays } = useContext(NostrContext);
  const { publicKey } = useKeysQuery();

  return useMutation(
    key,
    () => listenWhileFinish(pool, readRelays, [], publicKey!!, filters),
    options
  );
}
