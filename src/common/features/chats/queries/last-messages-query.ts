import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Message } from "../managers/message-manager-types";
import { ChatQueries } from "./queries";
import { getDirectLastMessage } from "../utils";
import { useDirectContactsQuery } from "./direct-contacts-query";
import { useChannelsQuery } from "./channels-query";
import { NostrQueries, useDirectMessagesQuery, usePublicMessagesQuery } from "../nostr/queries";
import { useKeysQuery } from "./keys-query";

export function useLastMessagesQuery() {
  const queryClient = useQueryClient();

  const { publicKey, privateKey } = useKeysQuery();
  const { data: contacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const { data: initialDirectMessages } = useDirectMessagesQuery(
    contacts ?? [],
    publicKey!!,
    privateKey!!
  );
  const { data: initialPublicMessages } = usePublicMessagesQuery(channels ?? []);

  const getContactsLastMessages = () =>
    (contacts ?? []).reduce<Record<string, Message | undefined>>((acc, current) => {
      const currentMessages = queryClient
        .getQueryData<Message[]>([NostrQueries.DIRECT_MESSAGES])
        ?.filter((i) => ("peer" in i ? i.peer === current?.pubkey : i.root === current?.pubkey));
      return { ...acc, [current.name]: getDirectLastMessage(currentMessages ?? []) };
    }, {});

  const getChannelsLastMessages = () =>
    (channels ?? []).reduce<Record<string, Message | undefined>>((acc, current) => {
      const currentMessages = queryClient
        .getQueryData<Message[]>([NostrQueries.PUBLIC_MESSAGES])
        ?.filter((i) => i.root === current.id);
      return { ...acc, [current.name]: getDirectLastMessage(currentMessages ?? []) };
    }, {});

  return useQuery<Record<string, Message | undefined>>(
    [ChatQueries.LAST_MESSAGES],
    async () => ({ ...getContactsLastMessages(), ...getChannelsLastMessages() }),
    {
      initialData: {},
      enabled: !!initialDirectMessages?.length || !!initialPublicMessages?.length
    }
  );
}
