import { ChatQueries } from "./queries";
import { Channel } from "../managers/message-manager-types";
import { useNostrFetchQuery } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";
import { useKeysQuery } from "./keys-query";
import { convertEvent } from "../nostr/utils/event-converter";

export function useChannelsQuery() {
  const { hasKeys } = useKeysQuery();
  // useMessageListenerQuery<Channel[], ChatQueries[]>(
  //   [ChatQueries.CHANNELS],
  //   MessageEvents.ChannelCreation,
  //   (data, nextData, resolver) =>
  //     resolver([...data, ...nextData.filter((ch) => !data.some((dCh) => ch.id === dCh.id))]),
  //   {
  //     initialData: []
  //   }
  // );
  //
  // useMessageListenerQuery<Channel[], ChatQueries[]>(
  //   [ChatQueries.CHANNELS],
  //   MessageEvents.ChannelUpdate,
  //   (data, nextData, resolver) =>
  //     resolver([...data, ...nextData.filter((ch) => !data.some((dCh) => ch.id === dCh.id))]),
  //   {
  //     initialData: []
  //   }
  // );
  //
  // useMessageListenerQuery<Channel[], ChatQueries[]>(
  //   [ChatQueries.CHANNELS],
  //   MessageEvents.LeftChannelList,
  //   (data, nextData, resolver) =>
  //     resolver([...data, ...nextData.filter((ch) => !data.some((dCh) => ch.id === dCh.id))]),
  //   {
  //     initialData: []
  //   }
  // );

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
