import { useQuery } from "@tanstack/react-query";
import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getAccounts } from "@/api/hive";

export function useGetAccountsQuery(usernames: string[]) {
  return useQuery({
    queryKey: [QueryIdentifiers.GET_ACCOUNTS],
    queryFn: () => getAccounts(usernames),
    enabled: usernames.length > 0,
    initialData: []
  });
}

export const getAccountsQuery = (usernames: string[]) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_ACCOUNTS],
    queryFn: () => getAccounts(usernames),
    enabled: usernames.length > 0,
    initialData: []
  });
