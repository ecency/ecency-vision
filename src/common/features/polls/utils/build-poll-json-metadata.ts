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
    filters: {
      account_age: poll.filters.accountAge,
      current_standing: poll.filters.currentStanding,
      vote_change: poll.filters.voteChange
    },
    end_time: poll.endTime.getTime() / 1000
  } as MetaData;
}
