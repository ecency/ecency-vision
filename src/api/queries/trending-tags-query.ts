import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { TrendingTag } from "@/entities";
import { isCommunity } from "@/utils";

export const getTrendingTagsQuery = (limit = 250) =>
  EcencyQueriesManager.generateClientServerInfiniteQuery({
    queryKey: [QueryIdentifiers.TRENDING_TAGS],
    queryFn: async ({ pageParam: { afterTag } }) =>
      client.database.call("get_trending_tags", [afterTag, limit]).then((tags: TrendingTag[]) => {
        return tags
          .filter((x) => x.name !== "")
          .filter((x) => !isCommunity(x.name))
          .map((x) => x.name);
      }),
    initialPageParam: { afterTag: "" },
    getNextPageParam: (lastPage) => ({
      afterTag: lastPage?.[lastPage?.length - 1]
    }),
    staleTime: Infinity,
    refetchOnMount: true
  });
