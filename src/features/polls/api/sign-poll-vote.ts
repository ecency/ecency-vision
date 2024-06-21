import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetPollDetailsQuery } from "./get-poll-details-query";
import { PollsVotesManagement } from "./polls-votes-management";
import { useGlobalStore } from "@/core/global-store";
import { error } from "@/features/shared";
import i18next from "i18next";
import { broadcastPostingJSON } from "@/api/operations";
import { QueryIdentifiers } from "@/core/react-query";

export function useSignPollVoteByKey(poll: ReturnType<typeof useGetPollDetailsQuery>["data"]) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["sign-poll-vote", poll?.author, poll?.permlink],
    mutationFn: async ({ choices }: { choices: Set<string> }) => {
      if (!poll || !activeUser) {
        error(i18next.t("polls.not-found"));
        return;
      }

      const choiceNums = poll.poll_choices
        ?.filter((pc) => choices.has(pc.choice_text))
        ?.map((i) => i.choice_num);
      if (choiceNums.length === 0) {
        error(i18next.t("polls.not-found"));
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

          return PollsVotesManagement.processVoting(activeUser, data, resp.choiceNums);
        }
      )
  });
}
