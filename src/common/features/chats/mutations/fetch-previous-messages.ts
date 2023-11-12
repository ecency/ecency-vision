import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Channel, useNostrFetchMutation } from "../nostr";
import { Event, Kind } from "../../../../lib/nostr-tools/event";
import { ChatQueries, useMessagesQuery } from "../queries";
import { convertEvent } from "../nostr/utils/event-converter";

export function useFetchPreviousMessages(channel?: Channel, onSuccess?: (events: Event[]) => void) {
  const queryClient = useQueryClient();

  const { data: messages } = useMessagesQuery(channel?.communityName);
  const { mutateAsync: fetchPreviousChannels } = useNostrFetchMutation(
    ["chats/nostr-fetch-previous-messages"],
    [
      {
        kinds: [Kind.ChannelMessage],
        "#e": [channel?.name!!],
        until: messages[0]?.created,
        limit: 50
      }
    ]
  );

  return useMutation(["chats/fetch-previous-messages"], async () => fetchPreviousChannels(), {
    onSuccess: (events) => {
      const previousMessages = events.map((event) => convertEvent<Kind.ChannelMessage>(event));
      queryClient.setQueryData(
        [ChatQueries.MESSAGES, channel?.name],
        [...messages, ...previousMessages]
      );
      queryClient.invalidateQueries([ChatQueries.MESSAGES, channel?.name]);

      onSuccess?.(events);
    }
  });
}
