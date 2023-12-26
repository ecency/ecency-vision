import { useQueries, useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getAccountFull } from "@/api/hive";

export function useGetAccountFullQuery(username?: string) {
  return useQuery({
    queryKey: [QueryIdentifiers.GET_ACCOUNT_FULL, username],
    queryFn: () => getAccountFull(username!),
    enabled: !!username
  });
}

export function useGetAccountsFullQuery(usernames: string[]) {
  return useQueries({
    queries: usernames.map((username) => ({
      queryKey: [QueryIdentifiers.GET_ACCOUNT_FULL, username],
      queryFn: () => getAccountFull(username!),
      enabled: !!username
    }))
  });
}
