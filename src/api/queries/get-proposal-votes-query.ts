import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { ProposalVote } from "@/entities";

export const getProposalVotesQuery = (proposalId: number, voter: string, limit: number) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.PROPOSAL_VOTES],
    queryFn: async () => {
      const response = (await client.call("condenser_api", "list_proposal_votes", [
        [proposalId, voter],
        limit,
        "by_proposal_voter"
      ])) as ProposalVote[];
      return response
        .filter((x: ProposalVote) => x.proposal.proposal_id === proposalId)
        .map((x: ProposalVote) => ({ id: x.id, voter: x.voter }));
    }
  });
