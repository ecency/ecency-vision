import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getCommunities } from "@/api/bridge";

export const getCommunitiesQuery = (sort: string, query?: string, limit = 100) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.COMMUNITIES, "rank", sort, query],
    queryFn: () => getCommunities("", limit, query ? query : null, sort === "hot" ? "rank" : sort)
  });
