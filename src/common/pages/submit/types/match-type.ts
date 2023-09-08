import { match } from "react-router-dom";

export type MatchType = match<{
  username?: string;
  permlink?: string;
  draftId?: string;
}>;
