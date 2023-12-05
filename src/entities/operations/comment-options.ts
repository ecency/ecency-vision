import { BeneficiaryRoute } from "./beneficiary-route";

export interface CommentOptions {
  allow_curation_rewards: boolean;
  allow_votes: boolean;
  author: string;
  permlink: string;
  max_accepted_payout: string;
  percent_hbd: number;
  extensions: Array<[0, { beneficiaries: BeneficiaryRoute[] }]>;
}
