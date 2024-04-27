import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../../core";
import { Entry } from "../../../store/entries/types";
import axios from "axios";

interface GetPollDetailsQueryResponse {
  author: string;
  created: string;
  end_time: string;
  filter_account_age_days: number;
  image: string;
  parent_permlink: string;
  permlink: string;
  platform: null;
  poll_choices: { choice_num: number; choice_text: string; votes?: { total_votes: number } }[];
  poll_stats: { total_voting_accounts_num: number };
  poll_trx_id: string;
  poll_voters?: { name: string; choice_num: number }[];
  post_body: string;
  post_title: string;
  preferred_interpretation: string;
  protocol_version: number;
  question: string;
  status: string;
  tags: string[];
  token: null;
}

export function useGetPollDetailsQuery(entry?: Entry) {
  return useQuery<GetPollDetailsQueryResponse>(
    [QueryIdentifiers.POLL_DETAILS, entry?.author, entry?.permlink],
    {
      queryFn: () =>
        axios
          .get(
            `https://polls.ecency.com/rpc/poll?author=eq.${entry!!.author}&permlink=eq.${
              entry!!.permlink
            }`
          )
          .then((resp) => resp.data[0]),
      enabled: !!entry,
      refetchOnMount: false
    }
  );
}
