import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getFragments } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";

export function useFragmentsQuery() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.FRAGMENTS, activeUser?.username],
    queryFn: () => getFragments(activeUser!.username),
    enabled: !!activeUser,
    initialData: []
  });
}
