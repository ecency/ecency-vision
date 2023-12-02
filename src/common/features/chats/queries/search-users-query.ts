import { useQuery } from "@tanstack/react-query";
import { getAccountReputations } from "../../../api/hive";

export function useSearchUsersQuery(query: string) {
  return useQuery(
    ["chats/search-user", query],
    async () => {
      if (!query) {
        return [];
      }
      const response = await getAccountReputations(query);
      response.sort((a, b) => (a.reputation > b.reputation ? -1 : 1));
      return response;
    },
    {
      initialData: []
    }
  );
}
