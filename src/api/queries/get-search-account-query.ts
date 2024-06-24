import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { AccountSearchResult } from "@/entities";

export const getSearchAccountQuery = (q: string, limit = 5, random = false) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.SEARCH_ACCOUNT, q, limit],
    queryFn: async () => {
      const data = { q, limit, random: +random };

      const response = await appAxios.post<AccountSearchResult[]>(
        apiBase(`/search-api/search-account`),
        data
      );
      return response.data;
    },
    enabled: !!q
  });
