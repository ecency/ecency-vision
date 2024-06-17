import { QueryClient } from "@tanstack/react-query";
import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { CurationDuration, CurationItem } from "@/entities";
import { apiBase } from "@/api/helper";
import { getAccounts } from "@/api/hive";
import { appAxios } from "@/api/axios";

async function fetch(duration: CurationDuration) {
  const resp = await appAxios.get<CurationItem[]>(apiBase(`/private-api/curation/${duration}`));
  const data = resp.data;

  const accounts = data.map((item) => item.account);
  const response = await getAccounts(accounts);

  for (let index = 0; index < response.length; index++) {
    const element = response[index];
    const curator = data[index];
    const effectiveVest: number =
      parseFloat(element.vesting_shares) +
      parseFloat(element.received_vesting_shares) -
      parseFloat(element.delegated_vesting_shares) -
      parseFloat(element.vesting_withdraw_rate);
    curator.efficiency = curator.vests / effectiveVest;
  }
  data.sort((a: CurationItem, b: CurationItem) => b.efficiency - a.efficiency);
  return data;
}

export const getDiscoverCurationQuery = (duration: CurationDuration) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.DISCOVER_CURATION, duration],
    queryFn: () => fetch(duration)
  });

export async function prefetchDiscoverCurationQuery(
  queryClient: QueryClient,
  duration: CurationDuration
) {
  await queryClient.prefetchQuery({
    queryKey: [QueryIdentifiers.DISCOVER_CURATION, duration],
    queryFn: () => fetch(duration)
  });

  return (
    queryClient.getQueryData<CurationItem[]>([QueryIdentifiers.DISCOVER_CURATION, duration]) ?? []
  );
}
