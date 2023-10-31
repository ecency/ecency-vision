import { QueryKey, QueryObserverResult, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { ChatContext } from "../chat-context-provider";
import { MessageEvents } from "../../../helper/message-service";
import useMap from "react-use/lib/useMap";
import useDebounce from "react-use/lib/useDebounce";
import { UseQueryOptions } from "@tanstack/react-query/src/types";

export const MessageListenerQueriesContext = createContext<{
  subscribers: Record<string, boolean>;
  set: (key: string, value: boolean) => void;
  get: (key: string) => boolean;
}>({
  subscribers: {},
  set: () => {},
  get: () => false
});

export function MessageListenerQueriesProvider({ children }: PropsWithChildren<unknown>) {
  const [subscribers, { set, get }] = useMap<Record<string, boolean>>();

  return (
    <MessageListenerQueriesContext.Provider value={{ subscribers, set, get }} children={children} />
  );
}

/**
 * Custom hook for listening to messages and updating a query with new data.
 *
 * @template TQData - The data type returned by the query.
 * @template TQKey - The key used to identify the query.
 * @param {TQKey} key - The key that identifies the query.
 * @param {MessageEvents} event - The message event to listen for.
 * @param {(data: TQData, nextData: TQData, resolver: (data: TQData) => void) => void} queryFn - The function that processes the received data and updates the query.
 * @param {UseQueryOptions<TQData>} [queryOptions] - Additional query options.
 * @returns {QueryObserverResult<TQData, unknown>} - The result of the query, including data and query status.
 */
export function useMessageListenerQuery<TQData, TQKey extends QueryKey>(
  key: TQKey,
  event: MessageEvents,
  queryFn: (data: TQData, nextData: TQData, resolver: (data: TQData) => void) => void,
  queryOptions?: UseQueryOptions<TQData>
): QueryObserverResult<TQData> {
  const { messageServiceInstance } = useContext(ChatContext);
  const { set, get } = useContext(MessageListenerQueriesContext);
  const queryClient = useQueryClient();

  const query = useQuery<TQData>(key, () => queryClient.getQueryData<TQData>(key)!!, queryOptions);

  const joinedKey = useMemo(() => key.join(""), [key]);

  const listener = (nextData: TQData) => {
    const resolver = (data: TQData) => queryClient.setQueryData(key, data);
    queryFn(query.data!!, nextData, resolver);
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
