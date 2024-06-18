import { EcencyQueriesManager, QueryIdentifiers } from "../react-query";
import { Community } from "@/entities";
import { isCommunity } from "@/utils";
import { bridgeApiCall } from "@/api/bridge";

export const getCommunityCache = (category?: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.COMMUNITY, category],
    queryFn: () => {
      if (!isCommunity(category ?? "")) {
        return;
      }
      return bridgeApiCall<Community | null>("get_community", { name: category, observer: "" });
    }
  });
