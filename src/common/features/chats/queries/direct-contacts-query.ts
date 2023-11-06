import { ChatQueries } from "./queries";
import { DirectContact, Message } from "../managers/message-manager-types";
import { useQuery } from "@tanstack/react-query";
import isCommunity from "../../../helper/is-community";
import { useMessagesQuery } from "./messages-query";
import { getDirectLastMessage } from "../utils";
import { useKeysQuery } from "./keys-query";
import { useChannelsQuery } from "./channels-query";
import { useNostrFetchQuery } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";

export function useDirectContactsQuery() {
  const { hasKeys } = useKeysQuery();
  const {
    data: channels,
    isSuccess: isChannelsLoaded,
    isError: isChannelsFailed
  } = useChannelsQuery();

  return useNostrFetchQuery<DirectContact[]>(
    [ChatQueries.DIRECT_CONTACTS],
    [Kind.Contacts],
    (events) => {
      // Get first event with profile info
      // note: events could be duplicated
      // todo: think about duplications filtering
      const profileEvent = events.find((event) => event.kind === Kind.Contacts);
      if (profileEvent) {
        return profileEvent.tags.map(([pubkey, name]) => ({ pubkey, name }));
      }
      return [];
    },
    {
      initialData: [],
      enabled: hasKeys && (isChannelsLoaded || isChannelsFailed),
      select: (data) => [
        ...(channels ?? []).map((channel) => ({
          name: channel.name,
          pubkey: ""
        })),
        ...data
      ]
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
