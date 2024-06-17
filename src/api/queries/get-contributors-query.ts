import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { shuffle } from "remeda";
import contributors from "@/consts/contributors.json";

export const getContributorsQuery = () =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.CONTRIBUTORS],
    queryFn: () => shuffle(contributors)
  });
