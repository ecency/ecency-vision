import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { Proposal } from "@/entities";

export const getProposalsQuery = () =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.PROPOSALS],
    queryFn: async () => {
      const response = (await client.call("database_api", "list_proposals", {
        start: [-1],
        limit: 500,
        order: "by_total_votes",
        order_direction: "descending",
        status: "all"
      })) as { proposals: Proposal[] };
      let proposals = response.proposals;
      const expired = proposals.filter((x) => x.status === "expired");
      const others = proposals.filter((x) => x.status !== "expired");
      return [...others, ...expired];
    }
  });
