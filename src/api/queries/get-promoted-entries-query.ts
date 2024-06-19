import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { Entry } from "@/entities";

export const getPromotedEntriesQuery = (usePrivate: boolean) =>
  EcencyQueriesManager.generateClientServerQuery({
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
