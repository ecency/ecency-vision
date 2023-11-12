import { useMutation } from "@tanstack/react-query";
import { useUpdateCommunityChannel } from "./update-community-channel";
import { Channel } from "../nostr";

interface Payload {
  hide: boolean;
  messageId: string;
}

export function useHideMessageInChannel(channel?: Channel) {
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

      return updateChannel(newUpdatedChannel);
    }
  );
}
