import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getWitnessesByVote } from "@/api/hive";
import { Witness } from "@/entities";

export const getWitnessesQuery = (limit: number) =>
  EcencyQueriesManager.generateClientServerInfiniteQuery({
    queryKey: [QueryIdentifiers.WITNESSES, limit],
    queryFn: async ({ pageParam }) => getWitnessesByVote(pageParam, limit),
    initialPageParam: "",
    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
      lastPage[lastPage.length - 1].owner
  });

export async function prefetchWitnessesQuery(queryClient: QueryClient) {
  const page = await getWitnessesByVote("", 50);

  return queryClient.setQueryData([QueryIdentifiers.WITNESSES, 50], {
    pageParams: [""],
    pages: [page]
  } as InfiniteData<Witness[]>);
}
