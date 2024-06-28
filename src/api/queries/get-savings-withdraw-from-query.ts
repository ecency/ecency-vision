import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { SavingsWithdrawRequest } from "@/entities";

export const getSavingsWithdrawFromQuery = (account: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.SAVING_WITHDRAW, account],
    queryFn: () =>
      client.database.call("get_savings_withdraw_from", [account]) as Promise<
        SavingsWithdrawRequest[]
      >,
    select: (data) => data.sort((a, b) => a.request_id - b.request_id)
  });
