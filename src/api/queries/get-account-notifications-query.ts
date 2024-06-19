import { useInfiniteQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { Community } from "@/entities";
import { AccountNotification, bridgeApiCall } from "@/api/bridge";

export function useGetAccountNotificationsQuery(community: Community, limit: number) {
  return useInfiniteQuery({
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
    initialData: {
      pages: [],
      pageParams: []
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage?.length > 0 ? lastPage[lastPage.length - 1].id : null)
  });
}
