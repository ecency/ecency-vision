import { useQuery } from "@tanstack/react-query";
import { client, getVestingDelegations } from "@/api/hive";
import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { DelegatedVestingShare } from "@/entities";

export function useGetVestingDelegationsQuery(username?: string, from?: string, limit?: number) {
  return useQuery({
    queryKey: [QueryIdentifiers.VESTING_DELEGATIONS, username, from, limit],
    queryFn: () => getVestingDelegations(username!, from, limit),
    enabled: !!username
  });
}

export const getVestingDelegationsQuery = (username?: string, from?: string, limit = 50) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.VESTING_DELEGATIONS, username, limit],
    queryFn: () =>
      client.database.call("get_vesting_delegations", [username, from, limit]) as Promise<
        DelegatedVestingShare[]
      >,
    enabled: !!username
  });
