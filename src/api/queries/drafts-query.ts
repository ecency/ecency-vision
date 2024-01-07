import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getDrafts } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";

export function useDraftsQuery() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.DRAFTS, activeUser?.username],
    queryFn: () => getDrafts(activeUser!.username),
    enabled: !!activeUser,
    initialData: []
  });
}
