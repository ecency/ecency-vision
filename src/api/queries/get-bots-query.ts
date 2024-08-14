import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { apiBase } from "@/api/helper";
import axios from "axios";

export const getBotsQuery = () =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_BOTS],
    queryFn: () =>
      axios.get<string[]>(apiBase("/private-api/public/bots")).then((resp) => resp.data),
    refetchOnMount: true,
    staleTime: Infinity
  });
