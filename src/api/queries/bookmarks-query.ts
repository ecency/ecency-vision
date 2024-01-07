import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getBookmarks } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";

export function useBookmarksQuery() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.BOOKMARKS, activeUser?.username],
    queryFn: () => getBookmarks(activeUser!.username),
    enabled: !!activeUser,
    initialData: []
  });
}
