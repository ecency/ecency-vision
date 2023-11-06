import { QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import { Event, Kind } from "../../../../lib/nostr-tools/event";
import { useContext } from "react";
import { NostrContext } from "./nostr-context";
import { ChatContext } from "../chat-context-provider";
import { UseQueryOptions } from "@tanstack/react-query/src/types";
import { listenWhileFinish } from "./utils";

export function useNostrFetchQuery<DATA>(
  key: QueryKey,
  kinds: Kind[],
  dataResolver: (events: Event[]) => DATA,
  queryOptions?: UseQueryOptions<DATA>
) {
  const { activeUserKeys } = useContext(ChatContext);
  const { pool, readRelays } = useContext(NostrContext);
  const queryClient = useQueryClient();

  return useQuery(
    key,
    async () => {
      const queryData = queryClient.getQueryData<DATA>(key);
      if (queryData && (Array.isArray(queryData) ? queryData.length > 0 : true)) {
        return queryData;
      }

      const events = await listenWhileFinish(pool, readRelays, kinds, activeUserKeys.pub);
      return dataResolver(events);
    },
    queryOptions
  );
}
