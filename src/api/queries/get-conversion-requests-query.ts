import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { ConversionRequest } from "@/entities";

export const getConversionRequestsQuery = (account: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.CONVERSION_REQUESTS, account],
    queryFn: () =>
      client.database.call("get_conversion_requests", [account]) as Promise<ConversionRequest[]>,
    select: (data) => data.sort((a, b) => a.requestid - b.requestid)
  });
