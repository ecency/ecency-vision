import { useQuery } from "@tanstack/react-query";
import { useDirectContactsQuery } from "./direct-contacts-query";
import { useMemo } from "react";
import { useDirectMessagesQuery, usePublicMessagesQuery } from "../nostr/queries";
import { ChatQueries } from "./queries";
import { Message } from "../managers/message-manager-types";
import { useChannelsQuery } from "./channels-query";
import { queryClient } from "../../../core";
import { useKeysQuery } from "./keys-query";

export function useMessagesQuery(username?: string) {
  const { privateKey, publicKey, hasKeys } = useKeysQuery();
  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();

  const { data: initialDirectMessages } = useDirectMessagesQuery(
    directContacts ?? [],
    publicKey!!,
    privateKey!!
  );
  const { data: initialPublicMessages } = usePublicMessagesQuery(channels ?? []);

  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.communityName === username),
    [channels, username]
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
      enabled: hasKeys,
      select: (messages) => {
        if (currentChannel) {
          return messages
            .filter((message) => !currentChannel.hiddenMessageIds?.includes(message.id))
            .sort((a, b) => a.created - b.created);
        }
        return messages.sort((a, b) => a.created - b.created);
      }
    }
  );
}
