import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getMarketData } from "@/api/misc";

export const getMarketDataQuery = (
  coin: string,
  vsCurrency: string,
  fromTs: string,
  toTs: string
) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.MARKET_DATA],
    queryFn: () => getMarketData(coin, vsCurrency, fromTs, toTs)
  });
