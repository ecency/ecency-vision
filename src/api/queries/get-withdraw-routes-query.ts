import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { WithdrawRoute } from "@/entities";

export const getWithdrawRoutesQuery = (account: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.WITHDRAW_ROUTES, account],
    queryFn: () =>
      client.database.call("get_withdraw_routes", [account, "outgoing"]) as Promise<WithdrawRoute[]>
  });
