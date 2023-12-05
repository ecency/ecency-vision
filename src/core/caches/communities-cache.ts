import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../react-query";
import * as bridgeApi from "../../api/bridge";
import { Community } from "../../store/communities";
import isCommunity from "../../helper/is-community";
import { useEffect } from "react";

export function useCommunityCache(category: string, invalidate?: boolean) {
  const client = useQueryClient();

  const query = useQuery<Community | null>([QueryIdentifiers.COMMUNITY, category], {
    queryFn: () => (isCommunity(category) ? bridgeApi.getCommunity(category) : null),
    initialData: null
  });

  useEffect(() => {
    if (invalidate) {
      client.invalidateQueries([QueryIdentifiers.COMMUNITY, category]);
    }
  }, []);

  return query;
}
