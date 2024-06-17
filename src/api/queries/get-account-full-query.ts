import { useQueries } from "@tanstack/react-query";
import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getAccountFull } from "@/api/hive";

export const getAccountFullQuery = (username?: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_ACCOUNT_FULL, username],
    queryFn: () => getAccountFull(username!)
  });

export function useGetAccountsFullQuery(usernames: string[]) {
  return useQueries({
    queries: usernames.map((username) => ({
      queryKey: [QueryIdentifiers.GET_ACCOUNT_FULL, username],
      queryFn: () => getAccountFull(username!),
      enabled: !!username
    }))
  });
}
