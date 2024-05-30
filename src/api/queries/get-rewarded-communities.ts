import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";

export function useGetRewardedCommunities() {
  return useQuery({
    queryKey: [QueryIdentifiers.REWARDED_COMMUNITIES],
    queryFn: async () => {
      const resp = await appAxios.get(apiBase(`/private-api/rewarded-communities`));
      return resp.data;
    }
  });
}
