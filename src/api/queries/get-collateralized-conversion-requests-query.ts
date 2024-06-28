import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { CollateralizedConversionRequest } from "@/entities";

export const getCollateralizedConversionRequestsQuery = (account: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.COLLATERALIZED_REQUESTS, account],
    queryFn: () =>
      client.database.call("get_collateralized_conversion_requests", [account]) as Promise<
        CollateralizedConversionRequest[]
      >,
    select: (data) => data.sort((a, b) => a.requestid - b.requestid)
  });
