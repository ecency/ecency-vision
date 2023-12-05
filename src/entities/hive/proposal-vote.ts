import { Proposal } from "./proposal";

export interface ProposalVote {
  id: number;
  proposal: Proposal;
  voter: string;
}
