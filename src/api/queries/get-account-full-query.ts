import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getAccount, getFollowCount } from "@/api/hive";
import { AccountFollowStats } from "@/entities";

export const getAccountFullQuery = (username?: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_ACCOUNT_FULL, username],
    queryFn: async () => {
      if (!username) {
        return;
      }
      const response = await getAccount(username);
      let follow_stats: AccountFollowStats | undefined;
      try {
        follow_stats = await getFollowCount(username);
      } catch (e) {}

      return { ...response, follow_stats };
    },
    enabled: !!username
  });
