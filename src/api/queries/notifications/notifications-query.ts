import { useInfiniteQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { useGlobalStore } from "@/core/global-store";
import { getNotifications } from "@/api/private-api";
import { NotificationFilter } from "@/enums";

/**
 * TODO: Make it infinite query
 * @param filter
 * @param since
 */
export function useNotificationsQuery(filter: NotificationFilter | null) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useInfiniteQuery({
    queryKey: [QueryIdentifiers.NOTIFICATIONS, activeUser?.username, filter],
    queryFn: ({ pageParam }) => getNotifications(activeUser?.username!, filter, pageParam),
    enabled: !!activeUser,
    initialData: { pages: [], pageParams: [] },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage?.[lastPage.length - 1]?.timestamp ?? ""
  });
}
