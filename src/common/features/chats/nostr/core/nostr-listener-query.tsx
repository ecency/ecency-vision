import { QueryKey, QueryObserverResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import useDebounce from "react-use/lib/useDebounce";
import { UseQueryOptions } from "@tanstack/react-query/src/types";
import { MessageEvents } from "../../../../helper/message-service";
import { ChatContext } from "../../chat-context-provider";
import { NostrListenerQueriesContext } from "./nostr-listeners-provider";

export function useNostrListenerQuery<TQData>(
  key: QueryKey,
  event: MessageEvents,
  queryFn: (data: TQData, nextData: TQData, resolver: (data: TQData) => void) => void,
  queryOptions?: UseQueryOptions<TQData>
): QueryObserverResult<TQData> {
  const { messageServiceInstance } = useContext(ChatContext);
  const { set, get } = useContext(NostrListenerQueriesContext);
  const queryClient = useQueryClient();

  const query = useQuery<TQData>(key, () => queryClient.getQueryData<TQData>(key)!!, queryOptions);

  const joinedKey = useMemo(() => key.join(""), [key]);

  const listener = (nextData: TQData) => {
    const resolver = (data: TQData) => queryClient.setQueryData(key, data);
    queryFn(query.data!!, nextData, resolver);

    queryClient.invalidateQueries(key);
  };

  useDebounce(
    () => {
      if (messageServiceInstance) {
        if (get(joinedKey)) {
          return;
        }

        messageServiceInstance.addListener(event, listener as any); // todo fix typings
        set(joinedKey, true);
      }
    },
    100,
    [messageServiceInstance]
  );

  return query;
}
