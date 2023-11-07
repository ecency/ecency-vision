import { QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import { Event, Kind } from "../../../../../lib/nostr-tools/event";
import { useContext } from "react";
import { NostrContext } from "../nostr-context";
import { ChatContext } from "../../chat-context-provider";
import { UseQueryOptions } from "@tanstack/react-query/src/types";
import { listenWhileFinish } from "../utils";
import { Filter } from "../../../../../lib/nostr-tools/filter";

export function useNostrFetchQuery<DATA>(
  key: QueryKey,
  kindsOrFilters: (Kind | Filter)[],
  dataResolver: (events: Event[]) => DATA | Promise<DATA>,
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

      const kinds = kindsOrFilters.every((item) => typeof item === "number")
        ? (kindsOrFilters as Kind[])
        : [];
      const filters = kindsOrFilters.every((item) => typeof item === "object")
        ? (kindsOrFilters as Filter[])
        : undefined;
      const events = await listenWhileFinish(pool, readRelays, kinds, activeUserKeys.pub, filters);
      return dataResolver(events);
    },
    queryOptions
  );
}
