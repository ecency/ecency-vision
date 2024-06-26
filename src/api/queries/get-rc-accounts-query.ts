import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { RCAPI } from "@hiveio/dhive";

export const getRcAccountsQuery = (username: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.RC_ACCOUNTS, username],
    queryFn: () => new RCAPI(client).findRCAccounts([username])
  });
