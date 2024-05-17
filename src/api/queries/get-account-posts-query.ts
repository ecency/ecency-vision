import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getAccountPosts } from "@/api/bridge";

export function useGetAccountPostsQuery(username?: string) {
  return useQuery({
    queryKey: [QueryIdentifiers.GET_POSTS, username],
    queryFn: () => getAccountPosts("posts", username!).then((response) => response ?? []),
    enabled: !!username,
    initialData: []
  });
}
