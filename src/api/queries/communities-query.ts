import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getCommunities } from "@/api/bridge";

export const getCommunitiesQuery = (sort: string, query?: string, limit = 100, enabled = true) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.COMMUNITIES, "rank", sort, query],
    queryFn: async () => {
      const response = await getCommunities(
        "",
        limit,
        query ? query : null,
        sort === "hot" ? "rank" : sort
      );
      return response ? (sort === "hot" ? response.sort(() => Math.random() - 0.5) : response) : [];
    },
    enabled
  });
