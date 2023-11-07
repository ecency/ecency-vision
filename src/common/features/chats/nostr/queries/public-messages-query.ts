import { useNostrFetchQuery } from "../core";
import { Channel, Message } from "../../managers/message-manager-types";
import { Filter } from "../../../../../lib/nostr-tools/filter";
import { Kind } from "../../../../../lib/nostr-tools/event";
import { convertEvent } from "../utils/event-converter";

export function usePublicMessagesQuery(channels: Channel[]) {
  return useNostrFetchQuery<Message[]>(
    ["chats/nostr-public-messages"],
    channels.reduce<Filter[]>(
      (acc, channel) => [
        ...acc,
        {
          kinds: [Kind.ChannelMessage],
          "#e": [channel.id],
          limit: 50
        }
      ],
      []
    ),
    (events) =>
      events.map((event) => convertEvent(event)).filter((message) => !!message) as Message[],
    {
      enabled: channels.length > 0
    }
  );
}
