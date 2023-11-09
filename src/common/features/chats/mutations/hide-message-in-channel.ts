import { Channel } from "../managers/message-manager-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpdateCommunityChannel } from "./update-community-channel";
import { ChatQueries, useChannelsQuery } from "../queries";

interface Payload {
  hide: boolean;
  messageId: string;
}

export function useHideMessageInChannel(channel?: Channel) {
  const queryClient = useQueryClient();

  const { data: channels } = useChannelsQuery();
  const { mutateAsync: updateChannel } = useUpdateCommunityChannel(channel);

  return useMutation(
    ["chats/hide-message-in-channel", channel?.name],
    async ({ hide, messageId }: Payload) => {
      if (!channel) {
        console.error("[Chat][Nostr] – trying to update not existing channel");
        return;
      }

      const newUpdatedChannel: Channel = { ...channel };

      if (hide) {
        newUpdatedChannel.hiddenMessageIds = [
          ...(newUpdatedChannel.hiddenMessageIds ?? []),
          messageId
        ];
      } else {
        newUpdatedChannel.hiddenMessageIds = newUpdatedChannel.hiddenMessageIds?.filter(
          (id) => id === messageId
        );
      }

      await updateChannel(newUpdatedChannel);
      return newUpdatedChannel;
    },
    {
      onSuccess: (channel) => {
        const channelsTemp = [...(channels ?? [])];
        const index = channelsTemp.findIndex((c) => c.id === channel?.id);
        if (index > -1 && channel) {
          channelsTemp[index] = channel;
          queryClient.setQueryData([ChatQueries.MESSAGES, channel?.communityName], []);
          queryClient.invalidateQueries([ChatQueries.MESSAGES, channel?.communityName]);
        }
      }
    }
  );
}
