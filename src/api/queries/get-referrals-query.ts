import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { ReferralItem, ReferralStat } from "@/entities";

export const getReferralsQuery = (username: string) =>
  EcencyQueriesManager.generateClientServerInfiniteQuery({
    queryKey: [QueryIdentifiers.REFERRALS, username],
    queryFn: async ({ pageParam: { maxId } }) => {
      const response = await appAxios.get<ReferralItem[]>(
        apiBase(`/private-api/referrals/${username}`),
        {
          params: {
            max_id: maxId
          }
        }
      );
      return response.data;
    },
    initialPageParam: {} as { maxId?: number },
    getNextPageParam: (lastPage) => ({
      maxId: lastPage?.[lastPage.length - 1]?.id
    })
  });

export const getReferralsStatsQuery = (username: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.REFERRALS_STATS, username],
    queryFn: async () => {
      try {
        const res = await appAxios.get(apiBase(`/private-api/referrals/${username}/stats`));
        if (!res.data) {
          throw new Error("No Referrals for this user!");
        }
        const convertReferralStat = (rawData: any) => {
          return {
            total: rawData.total || 0,
            rewarded: rawData.rewarded || 0
          } as ReferralStat;
        };
        return convertReferralStat(res.data);
      } catch (error) {
        console.warn(error);
        throw error;
      }
    }
  });
