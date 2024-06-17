import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../react-query";
import { useEffect } from "react";
import { Community } from "@/entities";
import { isCommunity } from "@/utils";
import { bridgeApiCall } from "@/api/bridge";

export async function prefetchCommunity(client: QueryClient, category?: string) {
  if (!isCommunity(category ?? "")) {
    return null;
  }

  const prefetchKey = [QueryIdentifiers.COMMUNITY, category];
  await client.prefetchQuery({
    queryKey: prefetchKey,
    queryFn: () =>
      bridgeApiCall<Community | null>("get_community", { name: category, observer: "" })
  });
  return client.getQueryData<Community>(prefetchKey) ?? null;
}

export function useCommunityCache(category?: string, observer: string = "", invalidate?: boolean) {
  const client = useQueryClient();

  const query = useQuery<Community | null>({
    queryKey: [QueryIdentifiers.COMMUNITY, category, observer],
    queryFn: () => bridgeApiCall<Community | null>("get_community", { name: category, observer }),
    initialData: null,
    enabled: !!category && isCommunity(category ?? "")
  });

  useEffect(() => {
    if (invalidate) {
      client.invalidateQueries({
        queryKey: [QueryIdentifiers.COMMUNITY, category]
      });
    }
  }, [category, client, invalidate]);

  return query;
}
