import { GetPollDetailsQueryResponse } from "./get-poll-details-query";
import { ActiveUser } from "@/entities";

export namespace PollsVotesManagement {
  export function processVoting(
    activeUser: ActiveUser | null,
    data: GetPollDetailsQueryResponse,
    choiceNums: number[]
  ): GetPollDetailsQueryResponse {
    const existingVotes = data.poll_voters?.filter((pv) => pv.name === activeUser!!.username);
    const existingUserChoices = data.poll_choices?.filter(
      (pc) => !!existingVotes?.some((ev) => ev.choice_num === pc.choice_num)
    );
    const currentUserChoices = data.poll_choices?.filter((pc) =>
      choiceNums.includes(pc.choice_num)
    );

    const notTouchedChoices = data.poll_choices?.filter(
      (pc) =>
        ![
          ...existingUserChoices?.map((puc) => puc.choice_num),
          ...currentUserChoices?.map((c) => c.choice_num)
        ].includes(pc.choice_num)
    );
    const nonActiveUserVotes =
      data.poll_voters?.filter((pv) => pv.name !== activeUser!!.username) ?? [];

    return {
      ...data,
      poll_choices: [
        ...notTouchedChoices,

        ...(existingUserChoices
          .filter((choice) => currentUserChoices.every((c) => choice.choice_text !== c.choice_text))
          .map((pv) => ({
            ...pv,
            votes: {
              hive_hp_incl_proxied: pv.votes?.hive_hp_incl_proxied!,
              total_votes: (pv?.votes?.total_votes ?? 0) - 1
            }
          })) ?? []),

        ...currentUserChoices.map((choice) => ({
          ...choice,
          votes: {
            hive_hp_incl_proxied: choice.votes?.hive_hp_incl_proxied!,
            total_votes:
              (choice?.votes?.total_votes ?? 0) +
              (existingUserChoices.every((pv) => pv.choice_text !== choice.choice_text) ? 1 : 0)
          }
        }))
      ],
      poll_voters: [
        ...nonActiveUserVotes,
        ...choiceNums.map((num) => ({ name: activeUser!.username, choice_num: num }))
      ],
      poll_stats: {
        total_hive_hp_incl_proxied: data.poll_stats?.total_hive_hp_incl_proxied ?? 0,
        total_voting_accounts_num:
          (data.poll_stats?.total_voting_accounts_num ?? 0) +
          (currentUserChoices.length - (existingVotes?.length ?? 0))
      }
    };
  }
}
