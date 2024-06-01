import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { Community, Subscription } from "@/entities";
import { bridgeApiCall } from "@/api/bridge";

export function useCommunitySubscribersQuery(community: Community) {
  return useQuery({
    queryKey: [QueryIdentifiers.COMMUNITY_SUBSCRIBERS, community.id],
    queryFn: () =>
      bridgeApiCall<Subscription[] | null>("list_subscribers", {
        community
      })
  });
}
