import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { useGlobalStore } from "@/core/global-store";
import { Entry } from "@/entities";

export function useGetPromotedEntriesQuery() {
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  return useQuery({
    queryKey: [QueryIdentifiers.PROMOTED_ENTRIES],
    queryFn: async () => {
      if (usePrivate) {
        const response = await appAxios.get<Entry[]>(apiBase(`/private-api/promoted-entries`));
        return response.data;
      }

      return [];
    },
    initialData: []
  });
}
