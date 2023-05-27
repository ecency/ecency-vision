import React, { createContext, useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Entry } from "../../store/entries/types";
import { QueryIdentifiers } from "../react-query";

export const EntriesCacheContext = createContext<{
  getById: (id: Entry["post_id"]) => Entry | undefined;
  updateCache: (entries: Entry[], skipInvalidation?: boolean) => void;
  updateReplies: (entryId: Entry["post_id"], replies: any[]) => void;
}>({
  getById: () => ({} as Entry),
  updateCache: () => {},
  updateReplies: () => {}
});

export const EntriesCacheManager = ({ children }: { children: any }) => {
  const [cache, setCache] = useState<Record<Entry["post_id"], Entry>>({});

  const queryClient = useQueryClient();

  const updateCache = (entries: Entry[], skipInvalidation = false) => {
    setCache({
      ...cache,
      ...entries.reduce((acc, entry) => ({ ...acc, [entry.post_id]: entry }), {})
    });

    if (!skipInvalidation) {
      // Invalidate queries which fetches entry details
      entries.forEach((entry) =>
        queryClient.invalidateQueries([QueryIdentifiers.ENTRY, entry.post_id])
      );
    }
  };

  const updateReplies = (entryId: Entry["post_id"], replies: any[]) => {
    updateCache([
      {
        ...cache[entryId],
        children: replies.length + 1,
        replies
      }
    ]);
  };

  const getById = (id: Entry["post_id"]): Entry | undefined => cache[id];

  return (
    <EntriesCacheContext.Provider value={{ updateCache, getById, updateReplies: updateReplies }}>
      {children}
    </EntriesCacheContext.Provider>
  );
};

export function useEntryCache<T extends Entry>(initialEntry: T) {
  const { getById, updateCache } = useContext(EntriesCacheContext);

  return useQuery([QueryIdentifiers.ENTRY, initialEntry.post_id], {
    initialData: initialEntry,
    queryFn: () => {
      const entry = getById(initialEntry.post_id) as T;
      if (!entry) {
        updateCache([initialEntry], true);
        return initialEntry;
      }

      return entry;
    }
  });
}
