import { useQuery } from "@tanstack/react-query";
import { Message } from "../managers/message-manager-types";
import { ChatQueries } from "./queries";
import { getDirectLastMessage } from "../utils";
import { useDirectContactsQuery } from "./direct-contacts-query";
import { useChannelsQuery } from "./channels-query";
import { useDirectMessagesQuery, usePublicMessagesQuery } from "../nostr/queries";
import { useContext } from "react";
import { ChatContext } from "../chat-context-provider";

export function useLastMessagesQuery() {
  const { activeUserKeys } = useContext(ChatContext);

  const { data: contacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const { data: initialDirectMessages } = useDirectMessagesQuery(
    contacts ?? [],
    activeUserKeys.pub,
    activeUserKeys.priv
  );
  const { data: initialPublicMessages } = usePublicMessagesQuery(channels ?? []);

  const getContactsLastMessages = () =>
    (contacts ?? []).reduce<Record<string, Message | undefined>>((acc, current) => {
      const currentMessages = initialDirectMessages?.filter((i) =>
        "peer" in i ? i.peer === current?.pubkey : i.root === current?.pubkey
      );
      return { ...acc, [current.name]: getDirectLastMessage(currentMessages ?? []) };
    }, {});

  const getChannelsLastMessages = () =>
    (channels ?? []).reduce<Record<string, Message | undefined>>((acc, current) => {
      const currentMessages = initialPublicMessages?.filter((i) => i.root === current.id);
      return { ...acc, [current.name]: getDirectLastMessage(currentMessages ?? []) };
    }, {});

  return useQuery<Record<string, Message | undefined>>(
    [ChatQueries.LAST_MESSAGES],
    async () => ({ ...getContactsLastMessages(), ...getChannelsLastMessages() }),
    {
      initialData: {},
      enabled: !!initialDirectMessages?.length && !!initialPublicMessages?.length
    }
  );
}
