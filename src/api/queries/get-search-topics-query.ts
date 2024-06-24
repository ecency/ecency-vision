import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { TagSearchResult } from "@/entities";

export const getSearchTopicsQuery = (q: string, limit = 20, random = false) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.SEARCH_TOPICS, q],
    queryFn: async () => {
      const data = { q, limit, random: +random };

      const response = await appAxios.post<TagSearchResult[]>(
        apiBase(`/search-api/search-tag`),
        data
      );
      return response.data;
    },
    enabled: !!q
  });
