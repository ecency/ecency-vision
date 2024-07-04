import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { utils } from "@hiveio/dhive";
import { ACCOUNT_OPERATION_GROUPS, OperationGroup } from "@/consts";
import { Transaction } from "@/entities";

export const ALL_ACCOUNT_OPERATIONS = [...Object.values(ACCOUNT_OPERATION_GROUPS)].reduce(
  (acc, val) => acc.concat(val),
  []
);

export const getTransactionsQuery = (
  username?: string,
  limit = 20,
  group: OperationGroup = "" as OperationGroup
) =>
  EcencyQueriesManager.generateClientServerInfiniteQuery({
    queryKey: [QueryIdentifiers.TRANSACTIONS, username, group],
    queryFn: async ({ pageParam }) => {
      if (!username) {
        return [];
      }

      let filters: any[];
      switch (group) {
        case "transfers":
          filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["transfers"]);
          break;
        case "market-orders":
          filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["market-orders"]);
          break;
        case "interests":
          filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["interests"]);
          break;
        case "stake-operations":
          filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["stake-operations"]);
          break;
        case "rewards":
          filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["rewards"]);
          break;
        default:
          filters = utils.makeBitMaskFilter(ALL_ACCOUNT_OPERATIONS); // all
      }

      const response = (await (filters
        ? client.call("condenser_api", "get_account_history", [
            username,
            pageParam,
            limit,
            ...filters
          ])
        : client.call("condenser_api", "get_account_history", [
            username,
            pageParam,
            limit
          ]))) as Transaction[];
      const mapped: Transaction[] = response.map((x: any) => ({
        num: x[0],
        type: x[1].op[0],
        timestamp: x[1].timestamp,
        trx_id: x[1].trx_id,
        ...x[1].op[1]
      }));

      return mapped.filter((x) => x !== null).sort((a: any, b: any) => b.num - a.num);
    },
    initialData: { pages: [], pageParams: [] },
    initialPageParam: -1,
    getNextPageParam: (_, __, lastPageParam) => lastPageParam + limit
  });
