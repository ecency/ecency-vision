import axios from "axios";
import { apiBase } from "@/api/helper";
import { SearchResponse } from "@/entities";
import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";

export const getSearchApiQuery = (
  q: string,
  sort: string,
  hideLow: boolean,
  since?: string,
  votes?: number
) =>
  EcencyQueriesManager.generateClientServerInfiniteQuery({
    queryKey: [QueryIdentifiers.SEARCH_API, q, sort, hideLow, since, votes],
    queryFn: async ({ pageParam }: { pageParam: { scrollId: string } }) => {
      const data: Record<string, any> = { q, sort, hide_low: hideLow };

      if (since) data.since = since;
      if (pageParam.scrollId) data.scroll_id = pageParam.scrollId;
      if (votes) data.votes = votes;

      const response = await axios.post<SearchResponse>(apiBase(`/search-api/search`), data);
      return response.data;
    },
    initialData: { pages: [], pageParams: [] },
    initialPageParam: { scrollId: "" },
    getNextPageParam: (lastPage: SearchResponse) => ({
      scrollId: lastPage?.scroll_id ?? ""
    }),
    enabled: !!q
  });
