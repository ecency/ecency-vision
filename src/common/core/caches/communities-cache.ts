import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "../react-query";
import * as bridgeApi from "../../api/bridge";
import { Community } from "../../store/communities/types";
import isCommunity from "../../helper/is-community";
import { useMappedStore } from "../../store/use-mapped-store";
import { useEffect } from "react";

export function useCommunityCache(category: string) {
  const { addCommunity } = useMappedStore();

  const query = useQuery<Community | null>([QueryIdentifiers.COMMUNITY, category], {
    queryFn: () => (isCommunity(category) ? bridgeApi.getCommunity(category) : null),
    initialData: null
  });

  // TODO: Remove it after moving all communities cache to queries
  useEffect(() => {
    if (query.data) {
      addCommunity(query.data);
    }
  }, [query.data]);

  return query;
}
