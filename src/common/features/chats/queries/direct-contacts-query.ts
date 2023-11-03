import { ChatQueries } from "./queries";
import { MessageEvents } from "../../../helper/message-service";
import { DirectContact, Message } from "../managers/message-manager-types";
import { useMessageListenerQuery } from "./message-listener-query";
import { useQuery } from "@tanstack/react-query";
import isCommunity from "../../../helper/is-community";
import { useMessagesQuery } from "./messages-query";
import { getDirectLastMessage } from "../utils";
import { useKeysQuery } from "./keys-query";

export function useDirectContactsQuery() {
  const { hasKeys } = useKeysQuery();

  return useMessageListenerQuery<DirectContact[], ChatQueries[]>(
    [ChatQueries.DIRECT_CONTACTS],
    MessageEvents.DirectContact,
    (data, directContacts, resolver) => {
      const result = [...data];
      directContacts.forEach(({ name, pubkey }) => {
        const isPresent = data.some((obj) => obj.name === name && obj.pubkey === pubkey);
        if (!isPresent) {
          result.push({ name, pubkey });
        }
      });
      if (result.length !== 0) {
        resolver(result);
      }
    },
    {
      initialData: [],
      enabled: hasKeys
    }
  );
}

export function useDirectContactsLastMessagesQuery() {
  const { data: contacts } = useDirectContactsQuery();
  const { data: messages } = useMessagesQuery("all");

  return useQuery<Record<string, Message>>(
    [ChatQueries.DIRECT_CONTACTS_LAST_MESSAGES],
    async () =>
      (contacts ?? []).reduce<Record<string, Message>>((acc, current) => {
        const currentMessages = messages.filter((i) =>
          !isCommunity(current.name) && "peer" in i
            ? i.peer === current?.pubkey
            : i.root === current?.pubkey
        );
        return { ...acc, [current.name]: getDirectLastMessage(currentMessages) };
      }, {}),
    {
      initialData: {},
      enabled: (contacts?.length ?? 0) > 0 && messages.length > 0
    }
  );
}
