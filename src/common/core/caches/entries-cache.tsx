import React, { createContext, useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Entry, EntryVote } from "../../store/entries/types";
import { QueryIdentifiers } from "../react-query";

export const EntriesCacheContext = createContext<{
  getById: (id: Entry["post_id"]) => Entry | undefined;
  updateCache: (entries: Entry[], skipInvalidation?: boolean) => void;
  addReply: (entryId: Entry["post_id"], reply: Entry) => void;
  updateRepliesCount: (entryId: Entry["post_id"], count: number) => void;
  updateVotes: (entryId: Entry["post_id"], votes: EntryVote[], estimated: number) => void;
}>({
  getById: () => ({} as Entry),
  updateCache: () => {},
  addReply: () => {},
  updateRepliesCount: () => {},
  updateVotes: () => {}
});

const cache = new Map<Entry["post_id"], Entry>();

export const EntriesCacheManager = ({ children }: { children: any }) => {
  const queryClient = useQueryClient();

  const updateCache = (entries: Entry[], skipInvalidation = false) => {
    entries.forEach((e) => cache.set(e.post_id, e));

    if (!skipInvalidation) {
      // Invalidate queries which fetches entry details(only after cache updating)
      entries.forEach((entry) =>
        queryClient.invalidateQueries([QueryIdentifiers.ENTRY, entry.post_id])
      );
    }
  };

  const addReply = (entryId: Entry["post_id"], reply: Entry) => {
    const cached = cache.get(entryId)!!;

    updateCache([
      {
        ...cached,
        children: cached.children + 1,
        replies: [reply, ...cached.replies]
      }
    ]);
  };

  const updateRepliesCount = (entryId: Entry["post_id"], count: number) => {
    updateCache([
      {
        ...cache.get(entryId)!!,
        children: count
      }
    ]);
  };

  const getById = (id: Entry["post_id"]): Entry | undefined => {
    return cache.get(id);
  };

  const updateVotes = (entryId: Entry["post_id"], votes: EntryVote[], estimated: number) => {
    updateCache([
      {
        ...cache.get(entryId)!!,
        active_votes: votes,
        total_votes: votes.length
      }
    ]);
  };

  return (
    <EntriesCacheContext.Provider
      value={{ updateCache, getById, addReply, updateRepliesCount, updateVotes }}
    >
      {children}
    </EntriesCacheContext.Provider>
  );
};

export function useEntryCache<T extends Entry>(initialEntry: T) {
  const { getById } = useContext(EntriesCacheContext);

  return useQuery([QueryIdentifiers.ENTRY, initialEntry.post_id], {
    initialData: initialEntry,
    queryFn: () => {
      const entry = getById(initialEntry.post_id) as T;
      if (!entry) {
        return initialEntry;
      }

      return entry;
    }
  });
}
