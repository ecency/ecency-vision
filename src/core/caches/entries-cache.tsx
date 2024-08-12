import { EcencyQueriesManager, getQueryClient, QueryIdentifiers } from "../react-query";
import * as bridgeApi from "../../api/bridge";
import dmca from "@/dmca.json";
import { Entry, EntryVote } from "@/entities";
import { makeEntryPath } from "@/utils";

export namespace EcencyEntriesCacheManagement {
  export function getEntryQueryByPath(author?: string, permlink?: string) {
    return EcencyQueriesManager.generateClientServerQuery({
      queryKey: [
        QueryIdentifiers.ENTRY,
        author && permlink ? makeEntryPath("", author!!, permlink!!) : "EMPTY"
      ],
      queryFn: () => bridgeApi.getPost(author, permlink),
      enabled: typeof author === "string" && typeof permlink === "string" && !!author && !!permlink,
      staleTime: Infinity
    });
  }

  export function getEntryQuery<T extends Entry>(initialEntry?: T) {
    return EcencyQueriesManager.generateClientServerQuery({
      queryKey: [
        QueryIdentifiers.ENTRY,
        initialEntry ? makeEntryPath("", initialEntry.author, initialEntry.permlink) : "EMPTY"
      ],
      queryFn: () => bridgeApi.getPost(initialEntry?.author, initialEntry?.permlink) as Promise<T>,
      initialData: initialEntry,
      enabled: !!initialEntry,
      staleTime: Infinity
    });
  }

  export function getNormalizedPostQuery<T extends Entry>(entry?: T) {
    return EcencyQueriesManager.generateClientServerQuery({
      queryKey: [
        QueryIdentifiers.NORMALIZED_ENTRY,
        entry ? makeEntryPath("", entry.author, entry.permlink) : "EMPTY"
      ],
      queryFn: () => bridgeApi.normalizePost(entry),
      enabled: !!entry
    });
  }

  export function addReply(entry: Entry | undefined, reply: Entry) {
    return mutateEntryInstance(entry, (value) => ({
      ...value,
      children: value.children + 1,
      replies: [reply, ...value.replies]
    }));
  }

  export function updateRepliesCount(entry: Entry, count: number) {
    return mutateEntryInstance(entry, (value) => ({
      ...value,
      children: count
    }));
  }

  export function updateVotes(entry: Entry, votes: EntryVote[], payout: number) {
    return mutateEntryInstance(entry, (value) => ({
      ...value,
      active_votes: votes,
      stats: { ...entry.stats, total_votes: votes.length, flag_weight: entry.stats.flag_weight },
      total_votes: votes.length,
      payout,
      pending_payout_value: String(payout)
    }));
  }

  export function invalidate(entry: Entry) {
    return getQueryClient().invalidateQueries({
      queryKey: [QueryIdentifiers.ENTRY, makeEntryPath("", entry.author, entry.permlink)]
    });
  }

  export function updateEntryQueryData(entries: Entry[]) {
    entries.forEach((entry) =>
      getQueryClient().setQueryData<Entry>(
        [QueryIdentifiers.ENTRY, makeEntryPath("", entry.author, entry.permlink)],
        () => {
          const data = { ...entry };
          if (
            dmca.some((rx: string) => new RegExp(rx).test(`@${entry.author}/${entry.permlink}`))
          ) {
            data.body = "This post is not available due to a copyright/fraudulent claim.";
            data.title = "";
          }

          return data;
        }
      )
    );
  }

  function mutateEntryInstance(entry: Entry | undefined, callback: (value: Entry) => Entry) {
    if (!entry) {
      throw new Error("Mutate entry instance – entry not provided");
    }

    const actualEntryValue = getQueryClient().getQueryData<Entry>([
      QueryIdentifiers.ENTRY,
      makeEntryPath("", entry.author, entry.permlink)
    ]);
    const value = callback(actualEntryValue ?? entry);
    return updateEntryQueryData([value]);
  }
}
