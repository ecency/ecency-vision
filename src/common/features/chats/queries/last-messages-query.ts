import { useMessagesQuery } from "./messages-query";
import { useQuery } from "@tanstack/react-query";
import { Message } from "../managers/message-manager-types";
import { ChatQueries } from "./queries";
import { getDirectLastMessage } from "../utils";
import { useDirectContactsQuery } from "./direct-contacts-query";
import { useChannelsQuery } from "./channels-query";

export function useLastMessagesQuery() {
  const { data: contacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const { data: messages } = useMessagesQuery("all");

  const getContactsLastMessages = () =>
    (contacts ?? []).reduce<Record<string, Message>>((acc, current) => {
      const currentMessages = messages.filter((i) =>
        "peer" in i ? i.peer === current?.pubkey : i.root === current?.pubkey
      );
      return { ...acc, [current.name]: getDirectLastMessage(currentMessages) };
    }, {});

  const getChannelsLastMessages = () =>
    (channels ?? []).reduce<Record<string, Message>>((acc, current) => {
      const currentMessages = messages.filter((i) => i.root === current.id);
      return { ...acc, [current.name]: getDirectLastMessage(currentMessages) };
    }, {});

  return useQuery<Record<string, Message>>(
    [ChatQueries.LAST_MESSAGES],
    async () => ({ ...getContactsLastMessages(), ...getChannelsLastMessages() }),
    {
      initialData: {},
      enabled: messages.length > 0
    }
  );
}
