import { useQuery } from "@tanstack/react-query";
import { Subscription } from "@/entities";
import { bridgeApiCall } from "@/api/bridge";
import { QueryIdentifiers } from "@/core/react-query";
import { useGlobalStore } from "@/core/global-store";

export function useGetSubscriptionsQuery() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.SUBSCRIPTIONS, activeUser?.username],
    queryFn: () =>
      bridgeApiCall<Subscription[] | null>("list_all_subscriptions", {
        account: activeUser?.username
      }),
    enabled: !!activeUser
  });
}
