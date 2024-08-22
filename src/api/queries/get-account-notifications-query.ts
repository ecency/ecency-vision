import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { Community } from "@/entities";
import { AccountNotification, bridgeApiCall } from "@/api/bridge";

export function getAccountNotificationsQuery(community: Community, limit: number) {
  return EcencyQueriesManager.generateClientServerInfiniteQuery({
    queryKey: [QueryIdentifiers.ACCOUNT_NOTIFICATIONS, community.name, limit],
    queryFn: async ({ pageParam }: { pageParam: number | null }) => {
      try {
        const response = await bridgeApiCall<AccountNotification[] | null>(
          "account_notifications",
          {
            account: community.name,
            limit,
            last_id: pageParam ?? undefined
          }
        );

        return response ?? ([] as AccountNotification[]);
      } catch (e) {
        return [];
      }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage?.length > 0 ? lastPage[lastPage.length - 1].id : null)
  });
}
