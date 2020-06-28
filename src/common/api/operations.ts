const hs = require("hivesigner");

export interface MetaData {
  links?: string[];
  images?: string[];
  users?: string[];
  tags?: string[];
  app?: string;
  format?: string;
  community?: string;
}

export interface BeneficiaryRoute {
  account: string;
  weight: number;
}

export interface CommentOptions {
  allow_curation_rewards: boolean;
  allow_votes: boolean;
  author: string;
  permlink: string;
  max_accepted_payout: string;
  percent_steem_dollars: number;
  extensions: Array<[0, { beneficiaries: BeneficiaryRoute[] }]>;
}

export type RewardType = "default" | "sp" | "dp";

import { User } from "../store/users/types";

export const formatError = (err: any) => {
  if (err.error_description) {
    return err.error_description.substring(0, 80);
  }
};

export const reblog = (user: User, author: string, permlink: string): Promise<any> => {
  var client = new hs.Client({
    accessToken: user.accessToken,
  });

  return client.reblog(user.username, author, permlink);
};

export const comment = (
  user: User,
  parentAuthor: string,
  parentPermlink: string,
  permlink: string,
  title: string,
  body: string,
  jsonMetadata: MetaData,
  options: CommentOptions | null
): Promise<any> => {
  const { username: author } = user;

  var client = new hs.Client({
    accessToken: user.accessToken,
  });

  const params = {
    parent_author: parentAuthor,
    parent_permlink: parentPermlink,
    author,
    permlink,
    title,
    body,
    json_metadata: JSON.stringify(jsonMetadata),
  };

  const opArray: any[] = [["comment", params]];

  if (options) {
    const e = ["comment_options", options];
    opArray.push(e);
  }

  return client.broadcast(opArray);
};
