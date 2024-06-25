import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { Proposal } from "@/entities";

export const getProposalQuery = (id: number) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.PROPOSAL, id],
    queryFn: async () => {
      const r = await client.call("condenser_api", "find_proposals", [[id]]);
      const proposal = r[0];
      if (new Date(proposal.start_date) < new Date() && new Date(proposal.end_date) >= new Date()) {
        proposal.status = "active";
      } else if (new Date(proposal.end_date) < new Date()) {
        proposal.status = "expired";
      } else {
        proposal.status = "inactive";
      }
      return proposal as Proposal;
    }
  });
