import { QueryClient, useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { shuffle } from "remeda";
import contributors from "@/consts/contributors.json";

export function useContributorsQuery() {
  return useQuery({
    queryKey: [QueryIdentifiers.CONTRIBUTORS],
    queryFn: () => shuffle(contributors)
  });
}

export async function prefetchContributorsQuery(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: [QueryIdentifiers.CONTRIBUTORS],
    queryFn: () => shuffle(contributors)
  });

  return queryClient.getQueryData<typeof contributors>([QueryIdentifiers.CONTRIBUTORS]);
}
