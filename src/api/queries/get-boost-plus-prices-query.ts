import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { ActiveUser, PromotePrice } from "@/entities";
import { getAccessToken } from "@/utils";
import axios from "axios";
import { apiBase } from "@/api/helper";

export const getBoostPlusPricesQuery = (activeUser: ActiveUser | null) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_BOOST_PLUS_PRICES],
    queryFn: async () => {
      if (!activeUser) {
        return [];
      }

      const data = { code: getAccessToken(activeUser.username) };
      const response = await axios.post<PromotePrice[]>(
        apiBase(`/private-api/boost-plus-price`),
        data
      );
      return response.data;
    },
    initialData: []
  });
