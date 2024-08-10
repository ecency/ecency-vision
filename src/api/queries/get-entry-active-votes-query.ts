import { useQuery } from "@tanstack/react-query";
import { Entry, Vote } from "@/entities";
import { QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";

export function useGetEntryActiveVotesQuery(entry?: Entry) {
  return useQuery({
    queryKey: [QueryIdentifiers.ENTRY_ACTIVE_VOTES, entry?.author, entry?.permlink],
    queryFn: () => {
      return client.database.call("get_active_votes", [entry?.author, entry?.permlink]) as Promise<
        Vote[]
      >;
    },
    enabled: !!entry
  });
}
