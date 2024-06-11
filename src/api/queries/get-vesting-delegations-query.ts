import { useQuery } from "@tanstack/react-query";
import { getVestingDelegations } from "@/api/hive";
import { QueryIdentifiers } from "@/core/react-query";

export function useGetVestingDelegationsQuery(username?: string, from?: string, limit?: number) {
  return useQuery({
    queryKey: [QueryIdentifiers.VESTING_DELEGATIONS, username, from, limit],
    queryFn: () => getVestingDelegations(username!, from, limit),
    enabled: !!username
  });
}
