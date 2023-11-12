import { ChatQueries } from "./queries";
import { Channel, useNostrFetchQuery } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";
import { useKeysQuery } from "./keys-query";
import { convertEvent } from "../nostr/utils/event-converter";

export function useChannelsQuery() {
  const { hasKeys } = useKeysQuery();
  return useNostrFetchQuery<Channel[]>(
    [ChatQueries.CHANNELS],
    [Kind.ChannelCreation],
    (events) =>
      events
        .map((event) => convertEvent<Kind.ChannelCreation>(event))
        .filter((channel) => !!channel) as Channel[],
    {
      initialData: [],
      enabled: hasKeys
    }
  );
}
