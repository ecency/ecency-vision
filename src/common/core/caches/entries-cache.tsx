import React, { createContext, useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Entry, EntryVote } from "../../store/entries/types";
import { QueryIdentifiers } from "../react-query";
import { makePath } from "../../components/entry-link";

export const EntriesCacheContext = createContext<{
  getByLink: (link: string) => Entry | undefined;
  updateCache: (entries: Entry[], skipInvalidation?: boolean) => void;
  addReply: (entry: Entry, reply: Entry) => void;
  updateRepliesCount: (entry: Entry, count: number) => void;
  updateVotes: (entry: Entry, votes: EntryVote[], estimated: number) => void;
}>({
  getByLink: () => ({} as Entry),
  updateCache: () => {},
  addReply: () => {},
  updateRepliesCount: () => {},
  updateVotes: () => {}
});

const cache = new Map<string, Entry>();

export const EntriesCacheManager = ({ children }: { children: any }) => {
  const queryClient = useQueryClient();

  const updateCache = (entries: Entry[], skipInvalidation = false) => {
    entries.forEach((e) => cache.set(makePath(e.category, e.author, e.permlink), e));

    if (!skipInvalidation) {
      // Invalidate queries which fetches entry details(only after cache updating)
      entries.forEach((entry) =>
        queryClient.invalidateQueries([
          QueryIdentifiers.ENTRY,
          makePath(entry.category, entry.author, entry.permlink)
        ])
      );
    }
  };

  const addReply = (entry: Entry, reply: Entry) => {
    const cached = cache.get(makePath(entry.category, entry.author, entry.permlink))!!;

    updateCache([
      {
        ...cached,
        children: cached.children + 1,
        replies: [reply, ...cached.replies]
      }
    ]);
  };

  const updateRepliesCount = (entry: Entry, count: number) => {
    updateCache([
      {
        ...cache.get(makePath(entry.category, entry.author, entry.permlink))!!,
        children: count
      }
    ]);
  };

  const getByLink = (link: string): Entry | undefined => {
    return cache.get(link);
  };

  const updateVotes = (entry: Entry, votes: EntryVote[], estimated: number) => {
    updateCache([
      {
        ...cache.get(makePath(entry.category, entry.author, entry.permlink))!!,
        active_votes: votes,
        total_votes: votes.length
      }
    ]);
  };

  return (
    <EntriesCacheContext.Provider
      value={{ updateCache, getByLink, addReply, updateRepliesCount, updateVotes }}
    >
      {children}
    </EntriesCacheContext.Provider>
  );
};

export function useEntryCache<T extends Entry>(initialEntry: T) {
  const { getByLink } = useContext(EntriesCacheContext);

  return useQuery(
    [
      QueryIdentifiers.ENTRY,
      makePath(initialEntry.category, initialEntry.author, initialEntry.permlink)
    ],
    {
      initialData: initialEntry,
      queryFn: () => {
        const entry = getByLink(
          makePath(initialEntry.category, initialEntry.author, initialEntry.permlink)
        ) as T;
        if (!entry) {
          return initialEntry;
        }

        return entry;
      }
    }
  );
}
