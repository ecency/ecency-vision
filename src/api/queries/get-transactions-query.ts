import { useInfiniteQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { utils } from "@hiveio/dhive";
import { ACCOUNT_OPERATION_GROUPS, OperationGroup } from "@/consts";
import { Transaction } from "@/entities";

export const ALL_ACCOUNT_OPERATIONS = [...Object.values(ACCOUNT_OPERATION_GROUPS)].reduce(
  (acc, val) => acc.concat(val),
  []
);

export function useGetTransactionsQuery(username?: string, limit = 20, group?: OperationGroup) {
  return useInfiniteQuery({
    queryKey: [QueryIdentifiers.TRANSACTIONS, username, group],
    queryFn: ({ pageParam }) => {
      if (!username) {
        return [];
      }

      const name = username.replace("@", "");

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

      return (
        filters
          ? client.call("condenser_api", "get_account_history", [
              username,
              pageParam,
              limit,
              ...filters
            ])
          : client.call("condenser_api", "get_account_history", [username, pageParam, limit])
      ) as Promise<Transaction[]>;
    },
    initialData: { pages: [], pageParams: [] },
    initialPageParam: -1,
    getNextPageParam: (_, __, lastPageParam) => lastPageParam + limit
  });
}
