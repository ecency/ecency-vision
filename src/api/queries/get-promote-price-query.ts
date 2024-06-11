import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/utils";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { useGlobalStore } from "@/core/global-store";
import { QueryIdentifiers } from "@/core/react-query";
import { PromotePrice } from "@/entities";

export function useGetPromotePriceQuery() {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.PROMOTE_PRICE],
    queryFn: async () => {
      const data = { code: getAccessToken(activeUser!.username) };
      const response = await appAxios.post<PromotePrice[]>(
        apiBase(`/private-api/promote-price`),
        data
      );
      return response.data;
    },
    select: (data) => data.sort((a, b) => a.duration - b.duration)
  });
}
