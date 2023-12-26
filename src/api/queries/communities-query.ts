import { Community } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getCommunities } from "@/api/bridge";

export function useCommunitiesQuery(sort: string, query?: string) {
  return useQuery<Community[]>({
    queryKey: [QueryIdentifiers.COMMUNITIES, sort, query],
    queryFn: async () =>
      getCommunities("", 100, query ? query : null, sort === "hot" ? "rank" : sort),
    initialData: []
  });
}

export async function fetchCommunitiesInServer() {
  const initialData = await getCommunities("", 100, null, "rank");
}
