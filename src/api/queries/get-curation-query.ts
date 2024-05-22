import { QueryClient, useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { CurationDuration, CurationItem, LeaderBoardDuration } from "@/entities";
import axios from "axios";
import { apiBase } from "@/api/helper";
import { getAccounts } from "@/api/hive";

async function fetch(duration: CurationDuration) {
  const resp = await axios.get<CurationItem[]>(apiBase(`/private-api/curation/${duration}`));
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
}

export async function prefetchDiscoverCurationQuery(
  queryClient: QueryClient,
  duration: LeaderBoardDuration
) {
  await queryClient.prefetchQuery({
    queryKey: [QueryIdentifiers.DISCOVER_CURATION, duration],
    queryFn: () =>
      axios
        .get<CurationItem[]>(apiBase(`/private-api/curation/${duration}`))
        .then((resp) => resp.data)
  });

  const curationData =
    queryClient.getQueryData<CurationItem[]>([QueryIdentifiers.DISCOVER_CURATION, duration]) ?? [];
}

export function useDiscoverCurationQuery(duration: LeaderBoardDuration) {
  return useQuery({
    queryKey: [QueryIdentifiers.DISCOVER_CURATION, duration],
    queryFn: () =>
      axios
        .get<CurationItem[]>(apiBase(`/private-api/curation/${duration}`))
        .then((resp) => resp.data),
    initialData: []
  });
}
