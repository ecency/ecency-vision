import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getTrendingTags } from "@/api/hive";

export function useTrendingTagsQuery() {
  return useQuery({
    queryKey: [QueryIdentifiers.TRENDING_TAGS],
    queryFn: async () => getTrendingTags(),
    initialData: []
  });
}
