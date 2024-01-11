import { useQuery } from "@tanstack/react-query";
import { getCommunities } from "../../../api/bridge";

export function useSearchCommunitiesQuery(query: string) {
  return useQuery(
    ["chats/search-communities", query],
    async () => {
      const response = await getCommunities("", 10, query);
      return response ?? [];
    },
    {
      initialData: []
    }
  );
}
