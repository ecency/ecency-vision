import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDirectContactsQuery } from "./direct-contacts-query";
import { useMemo } from "react";
import { NostrQueries, useDirectMessagesQuery, usePublicMessagesQuery } from "../nostr/queries";
import { ChatQueries } from "./queries";
import { useChannelsQuery } from "./channels-query";
import { useKeysQuery } from "./keys-query";
import { Message } from "../nostr";

export function useMessagesQuery(username?: string) {
  const queryClient = useQueryClient();

  const { privateKey, publicKey, hasKeys } = useKeysQuery();
  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();

  useDirectMessagesQuery(directContacts ?? [], publicKey!!, privateKey!!);
  usePublicMessagesQuery(channels ?? []);

  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.communityName === username),
    [channels, username]
  );
  const currentContact = useMemo(
    () => directContacts?.find((c) => c.name === username),
    [directContacts, username]
  );

  return useQuery<Message[]>(
    [ChatQueries.MESSAGES, username],
    async () => {
      if (!username) {
        return [];
      }

      if (!!currentChannel) {
        return (
          queryClient
            .getQueryData<Message[]>([NostrQueries.PUBLIC_MESSAGES])
            ?.filter((i) => i.root === currentChannel.id) ?? []
        );
      }

      return (
        queryClient
          .getQueryData<Message[]>([NostrQueries.DIRECT_MESSAGES])
          ?.filter((i) =>
            "peer" in i ? i.peer === currentContact?.pubkey : i.root === currentContact?.pubkey
          ) ?? []
      );
    },
    {
      initialData: [],
      enabled: hasKeys && !!username,
      select: (messages) => {
        if (currentChannel) {
          return messages
            .filter((message) => !currentChannel.hiddenMessageIds?.includes(message.id))
            .sort((a, b) => a.created - b.created);
        }
        return messages.sort((a, b) => a.created - b.created);
      },
      refetchInterval: 10000
    }
  );
}
