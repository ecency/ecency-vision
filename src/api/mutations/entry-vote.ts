import { useMutation } from "@tanstack/react-query";
import { Entry, EntryVote } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { formatError, vote } from "@/api/operations";
import { error } from "@/features/shared";
import { EntriesCacheContext } from "@/core/caches";
import { useContext } from "react";
import { getPost } from "@/api/hive";

export function useEntryVote(entry: Entry) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const updateActiveUser = useGlobalStore((s) => s.updateActiveUser);
  const { updateCache, updateVotes } = useContext(EntriesCacheContext);

  const afterVote = async (votes: EntryVote[], estimated: number) => {
    const _entry = entry;
    const { payout } = _entry;
    const newPayout = payout + estimated;
    if (_entry.active_votes) {
      updateVotes(entry, votes, newPayout);
    } else {
      const entry = await getPost(_entry.author, _entry.permlink);
      if (entry) {
        updateVotes(entry, votes, newPayout);
      }
    }
  };

  return useMutation({
    mutationKey: ["entryVote", entry.author, entry.permlink],
    mutationFn: async ({ weight, estimated }: { weight: number; estimated: number }) => {
      if (!activeUser) {
        return undefined;
      }

      await vote(activeUser?.username, entry.author, entry.permlink, weight);

      const votes: EntryVote[] = [
        ...(entry.active_votes
          ? entry.active_votes.filter((x) => x.voter !== activeUser?.username)
          : []),
        { rshares: weight, voter: activeUser?.username }
      ];
      afterVote(votes, estimated);
      updateActiveUser(); // refresh voting power
    },
    onError: (e) => error(...formatError(e))
  });
}
