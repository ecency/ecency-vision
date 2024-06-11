import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/hive";
import { QueryIdentifiers } from "@/core/react-query";
import { BlogEntry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";

export function useGetReblogsQuery(username?: string, limit = 200) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.REBLOGS, username, limit],
    queryFn: async () => {
      const response = (await client.call("condenser_api", "get_blog_entries", [
        username ?? activeUser?.username,
        0,
        limit
      ])) as BlogEntry[];
      return response
        .filter((i) => i.author !== activeUser?.username && !i.reblogged_on.startsWith("1970-"))
        .map((i) => ({ author: i.author, permlink: i.permlink }));
    }
  });
}
