import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { OpenOrdersData } from "@/entities";

export const getOpenOrdersQuery = (user: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.OPEN_ORDERS, user],
    queryFn: () =>
      client.call("condenser_api", "get_open_orders", [user]) as Promise<OpenOrdersData[]>,
    select: (data) => data.sort((a, b) => a.orderid - b.orderid),
    enabled: !!user
  });
