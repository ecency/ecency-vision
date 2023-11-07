import { useUpdateLeftChannels } from "../nostr";
import { useMutation } from "@tanstack/react-query";
import { useLeftCommunityChannelsQuery } from "../queries/left-community-channels-query";

export function useLeaveCommunityChannel(onSuccess?: () => void) {
  const { data: leftCommunityChannelsIds } = useLeftCommunityChannelsQuery();
  const { mutateAsync: updateLeftChannels } = useUpdateLeftChannels();

  return useMutation(["chats/leave-community-channels"], async (name: string) =>
    updateLeftChannels(
      {
        tags: [["d", "left-channel-list"]],
        eventMetadata: JSON.stringify([...(leftCommunityChannelsIds ?? []), name])
      },
      {
        onSuccess
      }
    )
  );
}
