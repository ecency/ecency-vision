import { useNostrFetchMutation } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";
import { convertEvent } from "../nostr/utils/event-converter";
import { ChatQueries, useChannelsQuery } from "../queries";
import { useQueryClient } from "@tanstack/react-query";

export function useAddCommunityChannel(name: string | undefined) {
  const { data: channels } = useChannelsQuery();
  const queryClient = useQueryClient();

  return useNostrFetchMutation(
    ["chats/add-community-channel"],
    [
      {
        kinds: [Kind.ChannelCreation],
        ids: name ? [name] : undefined
      },
      {
        kinds: [Kind.ChannelMetadata],
        "#e": name ? [name] : undefined
      },
      {
        kinds: [Kind.ChannelMessage],
        "#e": name ? [name] : undefined,
        limit: 30
      }
    ],
    {
      onSuccess: (events) => {
        events.forEach((event) => {
          switch (event.kind) {
            case Kind.ChannelCreation:
              const channel = convertEvent<Kind.ChannelCreation>(event);
              const hasChannelAlready = channels?.some(({ id }) => id === channel?.id);
              if (!hasChannelAlready && channel) {
                queryClient.setQueryData([ChatQueries.CHANNELS], [...(channels ?? []), channel]);
                queryClient.invalidateQueries([ChatQueries.CHANNELS]);
              }
          }
        });
      }
    }
  );
}
