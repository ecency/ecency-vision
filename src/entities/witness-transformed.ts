export interface WitnessTransformed {
  rank: number;
  name: string;
  miss: number;
  fee: string;
  feed: string;
  blockSize: number;
  acAvail: number;
  acBudget: number;
  version: string;
  url: string;
  parsedUrl?: {
    category: string;
    author: string;
    permlink: string;
  };
  signingKey?: string;
  priceAge: string;
  witnessBy?: string;
}
