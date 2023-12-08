import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../react-query";
import * as bridgeApi from "../../api/bridge";
import { useEffect } from "react";
import { Community } from "@/entities";
import { isCommunity } from "@/utils";

export function useCommunityCache(category: string, invalidate?: boolean, enabled = true) {
  const client = useQueryClient();

  const query = useQuery<Community | null>([QueryIdentifiers.COMMUNITY, category], {
    queryFn: () => (isCommunity(category) ? bridgeApi.getCommunity(category) : null),
    initialData: null,
    enabled
  });

  useEffect(() => {
    if (invalidate) {
      client.invalidateQueries([QueryIdentifiers.COMMUNITY, category]);
    }
  }, []);

  return query;
}
