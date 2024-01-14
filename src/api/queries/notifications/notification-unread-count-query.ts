import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { useGlobalStore } from "@/core/global-store";
import { getUnreadNotificationCount } from "@/api/private-api";

export function useNotificationUnreadCountQuery() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.NOTIFICATIONS_UNREAD_COUNT, activeUser?.username],
    queryFn: () => getUnreadNotificationCount(activeUser!.username),
    enabled: !!activeUser,
    initialData: 0,
    refetchInterval: 60000
  });
}
