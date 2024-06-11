import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { AccountFollowStats } from "@/entities";

export function useGetFollowCount(username: string) {
  return useQuery({
    queryKey: [QueryIdentifiers.FOLLOW_COUNT],
    queryFn: () =>
      client.database.call("get_follow_count", [username]) as Promise<AccountFollowStats>
  });
}
