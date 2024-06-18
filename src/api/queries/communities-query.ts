import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getCommunities } from "@/api/bridge";

export const getCommunitiesQuery = (sort: string, query?: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.COMMUNITIES, "rank", sort, query],
    queryFn: () => getCommunities("", 100, query ? query : null, sort === "hot" ? "rank" : sort)
  });
