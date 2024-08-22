import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { Community, Subscription } from "@/entities";
import { bridgeApiCall } from "@/api/bridge";

export function getCommunitySubscribersQuery(community: Community) {
  return EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.COMMUNITY_SUBSCRIBERS, community.id],
    queryFn: async () => {
      const response = await bridgeApiCall<Subscription[] | null>("list_subscribers", {
        community: community.name
      });
      return response ?? [];
    },
    staleTime: 60000
  });
}
