import { InfiniteData, QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiBase } from "@/api/helper";
import { SearchResponse } from "@/entities";
import { QueryIdentifiers } from "@/core/react-query";

function buildQueryBody(q: string, sort: string, hideLow: string, since?: string, votes?: number) {
  return {
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
      scrollId: lastPage.scroll_id ?? ""
    })
  };
}

export async function prefetchSearchApiQuery(
  queryClient: QueryClient,
  q: string,
  sort: string,
  hideLow: string,
  since?: string,
  votes?: number
) {
  await queryClient.prefetchInfiniteQuery(buildQueryBody(q, sort, hideLow, since, votes));
}

export function getSearchApiQueryData(
  queryClient: QueryClient,
  q: string,
  sort: string,
  hideLow: string,
  since?: string,
  votes?: number
) {
  return queryClient.getQueryData<InfiniteData<SearchResponse>>([
    QueryIdentifiers.SEARCH_API,
    q,
    sort,
    hideLow,
    since,
    votes
  ]);
}
