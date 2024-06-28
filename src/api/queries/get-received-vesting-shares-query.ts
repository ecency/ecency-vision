import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { ReceivedVestingShare } from "@/entities";
import { parseAsset } from "@/utils";

export const getReceivedVestingSharesQuery = (username: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.RECEIVED_VESTING_SHARES, username],
    queryFn: async () => {
      const response = await appAxios.get<{ list: ReceivedVestingShare[] }>(
        apiBase(`/private-api/received-vesting/${username}`)
      );
      return response.data.list;
    },
    select: (data) =>
      data.sort((a, b) => parseAsset(b.vesting_shares).amount - parseAsset(a.vesting_shares).amount)
  });
