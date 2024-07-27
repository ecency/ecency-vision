import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";

export const getOrderBookQuery = (limit = 500) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_ORDER_BOOK],
    queryFn: () => client.call("condenser_api", "get_order_book", [limit])
  });
