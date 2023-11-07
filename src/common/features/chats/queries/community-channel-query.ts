import { useQuery } from "@tanstack/react-query";
import { ChatQueries } from "./queries";
import { Community } from "../../../store/communities";
import { getProfileMetaData } from "../utils";
import { Channel } from "../managers/message-manager-types";

/**
 * Get the community's channel information
 * @see {@link ../mutations/create-community-chat.ts}
 */
export function useCommunityChannelQuery(community?: Community) {
  return useQuery<Channel>([ChatQueries.COMMUNITY_CHANNEL, community?.name], async () => {
    if (!community) {
      return undefined;
    }

    const communityProfile = await getProfileMetaData(community.name);
    return communityProfile.channel;
  });
}
