import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { RewardedCommunity } from "@/entities";

export function useGetRewardedCommunities() {
  return useQuery({
    queryKey: [QueryIdentifiers.REWARDED_COMMUNITIES],
    queryFn: async () => {
      const resp = await appAxios.get<RewardedCommunity[]>(
        apiBase(`/private-api/rewarded-communities`)
      );
      return resp.data;
    }
  });
}
