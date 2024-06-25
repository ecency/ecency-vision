import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getAccountFull } from "@/api/hive";

export const getAccountFullQuery = (username?: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_ACCOUNT_FULL, username],
    queryFn: () => getAccountFull(username!),
    enabled: !!username
  });
