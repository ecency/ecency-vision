import { useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Channel, ChatContext, ChatQueries, useCommunityChannelQuery } from "@ecency/ns-query";
import { useGetAccountFullQuery } from "../../../api/queries";
import { useCommunityCache } from "../../../core";

export function useCreateTemporaryChannel(communityName: string) {
  const queryClient = useQueryClient();
  const { activeUsername } = useContext(ChatContext);

  const { data: communityUserData } = useGetAccountFullQuery(communityName);
  const { data: community } = useCommunityCache(communityName);
  const { data: communityChannel } = useCommunityChannelQuery(
    community ? community : undefined,
    communityUserData
  );

  // Create temporary channel
  // `not_joined_${communityName}` – special constructor for creating a temporary channel id
  return useEffect(() => {
    if (communityChannel) {
      queryClient.setQueryData<Channel[]>(
        [ChatQueries.JOINED_CHANNELS, activeUsername],
        [
          ...(queryClient.getQueryData<Channel[]>([ChatQueries.JOINED_CHANNELS, activeUsername]) ??
            []),
          communityChannel
        ]
      );
    }
  }, [communityChannel]);
}
