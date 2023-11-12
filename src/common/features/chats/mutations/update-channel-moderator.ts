import { useMutation } from "@tanstack/react-query";
import { useUpdateCommunityChannel } from "./update-community-channel";
import { Channel, CommunityModerator } from "../nostr";

export function useUpdateChannelModerator(channel?: Channel) {
  const { mutateAsync: updateChannel } = useUpdateCommunityChannel(channel);

  return useMutation(
    ["chats/update-channel-moderator", channel?.communityName],
    async (moderator: CommunityModerator) => {
      const moderatorIndex = channel?.communityModerators?.findIndex(
        (mod) => mod.name === moderator.name
      );
      if (!channel) {
        console.error("[Chat][Nostr] – trying to update not existing channel");
        return;
      }

      const newUpdatedChannel: Channel = { ...channel };
      if (moderatorIndex === -1) {
        newUpdatedChannel!.communityModerators?.push(moderator);
      } else {
        newUpdatedChannel!.communityModerators![moderatorIndex!] = moderator;
      }

      return updateChannel(newUpdatedChannel);
    }
  );
}
