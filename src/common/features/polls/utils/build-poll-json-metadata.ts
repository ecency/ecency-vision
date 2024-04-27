import { PollSnapshot } from "../components";
import { MetaData } from "../../../api/operations";

export function buildPollJsonMetadata(poll: PollSnapshot) {
  return {
    content_type: "poll",
    version: 0.6,
    question: poll.title,
    choices: poll.choices,
    preferred_interpretation: poll.interpretation,
    token: null,
    hide_votes: poll.hide_votes,
    vote_change: poll.voteChange,
    filters: {
      account_age: poll.filters.accountAge
    },
    end_time: poll.endTime.getTime() / 1000
  } as MetaData;
}
