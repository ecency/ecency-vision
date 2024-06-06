import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetPollDetailsQuery } from "./get-poll-details-query";
import { error } from "../../../components/feedback";
import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import { broadcastPostingJSON } from "../../../api/operations";
import { QueryIdentifiers } from "../../../core";

export function useSignPollVoteByKey(poll: ReturnType<typeof useGetPollDetailsQuery>["data"]) {
  const { activeUser } = useMappedStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["sign-poll-vote", poll?.author, poll?.permlink],
    mutationFn: async ({ choices }: { choices: Set<string> }) => {
      if (!poll || !activeUser) {
        error(_t("polls.not-found"));
        return;
      }

      const choiceNums = poll.poll_choices
        ?.filter((pc) => choices.has(pc.choice_text))
        ?.map((i) => i.choice_num);
      if (choiceNums.length === 0) {
        error(_t("polls.not-found"));
        return;
      }

      await broadcastPostingJSON(activeUser.username, "polls", {
        poll: poll.poll_trx_id,
        action: "vote",
        choices: choiceNums
      });

      return { choiceNums: choiceNums };
    },
    onSuccess: (resp) =>
      queryClient.setQueryData<ReturnType<typeof useGetPollDetailsQuery>["data"]>(
        [QueryIdentifiers.POLL_DETAILS, poll?.author, poll?.permlink],
        (data) => {
          if (!data || !resp) {
            return data;
          }

          const existingVotes = data.poll_voters?.filter((pv) => pv.name === activeUser!!.username);
          const previousUserChoices = data.poll_choices?.filter((pc) =>
            existingVotes?.some((ev) => ev.choice_num === pc.choice_num)
          );
          const choices = data.poll_choices?.filter((pc) => !!resp.choiceNums[pc.choice_num]);

          const notTouchedChoices = data.poll_choices?.filter(
            (pc) =>
              ![
                ...previousUserChoices?.map((puc) => puc.choice_num),
                choices?.map((c) => c.choice_num)
              ].includes(pc.choice_num)
          );
          const otherVoters =
            data.poll_voters?.filter((pv) => pv.name !== activeUser!!.username) ?? [];

          return {
            ...data,
            poll_choices: [
              ...notTouchedChoices,
              ...(previousUserChoices
                .filter((pv) => choices.every((c) => pv.choice_text !== c.choice_text))
                .map((pv) => ({
                  ...pv,
                  votes: {
                    total_votes: (pv?.votes?.total_votes ?? 0) - 1
                  }
                })) ?? []),
              ...choices.map((choice) => ({
                ...choice,
                votes: {
                  total_votes:
                    (choice?.votes?.total_votes ?? 0) +
                    (previousUserChoices.every((pv) => pv.choice_text !== choice.choice_text)
                      ? 1
                      : 0)
                }
              }))
            ].filter((el) => !!el),
            poll_voters: [
              ...otherVoters,
              ...resp.choiceNums.map((num) => ({ name: activeUser?.username, choice_num: num }))
            ],
            poll_stats: {
              ...data.poll_stats,
              total_voting_accounts_num:
                data.poll_stats.total_voting_accounts_num +
                (choices.length - (existingVotes?.length ?? 0))
            }
          } as ReturnType<typeof useGetPollDetailsQuery>["data"];
        }
      )
  });
}
