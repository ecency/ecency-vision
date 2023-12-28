import { InfiniteData, QueryClient, QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getWitnessesByVote } from "@/api/hive";
import { Witness } from "@/entities";

export function useWitnessesQuery(limit: number) {
  return useInfiniteQuery<Witness[], Error, InfiniteData<Witness[]>, QueryKey, string>({
    queryKey: [QueryIdentifiers.WITNESSES, limit],
    queryFn: async ({ pageParam }) => getWitnessesByVote(pageParam, limit),
    initialPageParam: "",
    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
      lastPage[lastPage.length - 1].owner
  });
}

export async function prefetchWitnessesQuery(queryClient: QueryClient) {
  const page = await getWitnessesByVote("", 30);

  return queryClient.setQueryData([QueryIdentifiers.WITNESSES, 30], {
    pageParams: [""],
    pages: [page]
  } as InfiniteData<Witness[]>);
}
