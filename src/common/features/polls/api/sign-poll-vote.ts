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
    mutationFn: async ({ choice }: { choice: string }) => {
      if (!poll || !activeUser) {
        error(_t("polls.not-found"));
        return;
      }

      const choiceNum = poll.poll_choices?.find((pc) => pc.choice_text === choice)?.choice_num;
      if (typeof choiceNum !== "number") {
        error(_t("polls.not-found"));
        return;
      }

      await broadcastPostingJSON(activeUser.username, "polls", {
        poll: poll.poll_trx_id,
        action: "vote",
        choice: choiceNum
      });

      return { choiceNum };
    },
    onSuccess: (resp) =>
      queryClient.setQueryData<ReturnType<typeof useGetPollDetailsQuery>["data"]>(
        [QueryIdentifiers.POLL_DETAILS, poll?.author, poll?.permlink],
        (data) => {
          if (!data || !resp) {
            return data;
          }

          const previousUserChoice = data.poll_choices?.find(
            (pc) =>
              data.poll_voters.find((pv) => pv.name === activeUser!!.username)?.choice_num ===
              pc.choice_num
          );
          const choice = data.poll_choices?.find((pc) => pc.choice_num === resp.choiceNum)!!;
          return {
            ...data,
            poll_choices: [
              ...data.poll_choices?.filter((pc) =>
                pc.choice_num !== choice.choice_num && previousUserChoice?.choice_num
                  ? pc.choice_num !== previousUserChoice.choice_num
                  : true
              ),
              {
                ...previousUserChoice,
                votes: {
                  total_votes: (previousUserChoice?.votes?.total_votes ?? 0) - 1
                }
              },
              {
                ...choice,
                votes: {
                  total_votes: (choice?.votes?.total_votes ?? 0) + 1
                }
              }
            ],
            poll_voters: [
              ...data.poll_voters.filter((pv) => pv.name !== activeUser!!.username),
              { name: activeUser?.username, choice_num: resp.choiceNum }
            ]
          } as ReturnType<typeof useGetPollDetailsQuery>["data"];
        }
      )
  });
}
