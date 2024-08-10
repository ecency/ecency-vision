import { useMutation } from "@tanstack/react-query";
import { Entry, EntryVote } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { formatError, vote } from "@/api/operations";
import { error } from "@/features/shared";
import { getPost } from "@/api/hive";
import { getQueryClient, QueryIdentifiers } from "@/core/react-query";
import { EcencyEntriesCacheManagement } from "@/core/caches";

export function useEntryVote(entry?: Entry) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const updateActiveUser = useGlobalStore((s) => s.updateActiveUser);

  const afterVote = async (votes: EntryVote[], estimated: number) => {
    if (!entry) {
      throw new Error("No entry provided");
    }

    const _entry = entry;
    const { payout } = _entry;
    const newPayout = payout + estimated;
    if (_entry.active_votes) {
      EcencyEntriesCacheManagement.updateVotes(entry, votes, newPayout);
    } else {
      const entry = await getPost(_entry.author, _entry.permlink);
      if (entry) {
        EcencyEntriesCacheManagement.updateVotes(entry, votes, newPayout);
      }
    }
  };

  return useMutation({
    mutationKey: ["entryVote", entry?.author, entry?.permlink],
    mutationFn: async ({ weight, estimated }: { weight: number; estimated: number }) => {
      if (!entry) {
        throw new Error("Entry not provided");
      }

      if (!activeUser) {
        throw new Error("Active user not provided");
      }

      await vote(activeUser?.username, entry.author, entry.permlink, weight);
      await updateActiveUser(); // refresh voting power

      return [
        estimated,
        [
          ...(entry.active_votes
            ? entry.active_votes.filter((x) => x.voter !== activeUser?.username)
            : []),
          { rshares: weight, voter: activeUser?.username }
        ]
      ] as const;
    },
    onSuccess: ([estimated, votes]) => {
      afterVote([...votes], estimated);
      getQueryClient().invalidateQueries({
        queryKey: [QueryIdentifiers.ENTRY_ACTIVE_VOTES, entry!.author, entry!.permlink]
      });
    },
    onError: (e) => error(...formatError(e))
  });
}
