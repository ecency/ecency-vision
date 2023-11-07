import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDirectContactsQuery } from "./direct-contacts-query";
import { useContext, useMemo } from "react";
import { ChatContext } from "../chat-context-provider";
import { useDirectMessagesQuery, usePublicMessagesQuery } from "../nostr/queries";
import { ChatQueries } from "./queries";
import { Message } from "../managers/message-manager-types";
import { useChannelsQuery } from "./channels-query";

export function useMessagesQuery(username?: string) {
  const queryClient = useQueryClient();
  const { activeUserKeys } = useContext(ChatContext);
  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();

  const { data: initialDirectMessages } = useDirectMessagesQuery(
    directContacts ?? [],
    activeUserKeys.pub,
    activeUserKeys.priv
  );
  const { data: initialPublicMessages } = usePublicMessagesQuery(channels ?? []);

  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.name === username),
    [channels]
  );

  return useQuery<Message[]>(
    [ChatQueries.MESSAGES, username],
    async () => {
      if (!username) {
        return [];
      }

      const existingMessages =
        queryClient.getQueryData<Message[]>([ChatQueries.MESSAGES, username]) ?? [];

      if (existingMessages.length > 0) {
        return existingMessages;
      }

      if (!!currentChannel) {
        return [...(initialPublicMessages ?? [])];
      }

      return [...(initialDirectMessages ?? [])];
    },
    {
      initialData: [],
      select: (messages) => {
        if (currentChannel) {
          return messages.filter(
            (message) => !currentChannel.hiddenMessageIds?.includes(message.id)
          );
        }
        return messages;
      }
    }
  );
}
