import { PollSnapshot } from "../components";
import { MetaData } from "../../../api/operations";

export function buildPollJsonMetadata(poll: PollSnapshot) {
  return {
    content_type: "poll",
    version: 0.1,
    question: poll.title,
    choices: poll.choices,
    preferred_interpretation: "number_of_votes",
    token: null,
    current_standing: poll.currentStanding,
    vote_change: poll.voteChange,
    filters: {
      account_age: poll.filters.accountAge
    },
    end_time: poll.endTime.getTime() / 1000
  } as MetaData;
}
