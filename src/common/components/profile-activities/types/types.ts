export interface ActivityTypes {
    type: string;
      parent_author?: string;
      parent_permlink?: string;
      author?: string;
      permlink?: string;
      payment?: number;
      payer?: string;
      following?: string;
      community?: string;
      approve?: boolean;
      proposal_ids?: string;
      account?: string;
      id?: string;
      what?: string[];
      voter?: string;
      witness?: string;
      json: string;
    timestamp: string;
  }