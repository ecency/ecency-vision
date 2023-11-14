import { useNostrFetchQuery } from "../core";
import { Filter } from "../../../../../lib/nostr-tools/filter";
import { Kind } from "../../../../../lib/nostr-tools/event";
import { convertEvent } from "../utils/event-converter";
import { NostrQueries } from "./queries";
import { Channel, Message } from "../types";

export function usePublicMessagesQuery(channels: Channel[]) {
  return useNostrFetchQuery<Message[]>(
    [NostrQueries.PUBLIC_MESSAGES],
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
      enabled: channels.length > 0,
      initialData: [],
      refetchInterval: 10000
    }
  );
}
