import React, { createContext, useContext, useEffect, useState } from "react";
import {
  DefinedQueryObserverResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { Entry, EntryVote } from "../../store/entries/types";
import { queryClient, QueryIdentifiers } from "../react-query";
import { makePath } from "../../components/entry-link";
import * as bridgeApi from "../../api/bridge";
import { useMappedStore } from "../../store/use-mapped-store";
import dmca from "../../constants/dmca.json";
import { commentHistory } from "../../api/private-api";

export const EntriesCacheContext = createContext<{
  getByLink: (link: string) => Entry | undefined;
  updateCache: (entries: Entry[], skipInvalidation?: boolean) => Entry[];
  addReply: (entry: Entry, reply: Entry) => void;
  updateRepliesCount: (entry: Entry, count: number) => void;
  updateVotes: (entry: Entry, votes: EntryVote[], estimated: number) => void;
}>({
  getByLink: () => ({} as Entry),
  updateCache: () => [],
  addReply: () => {},
  updateRepliesCount: () => {},
  updateVotes: () => {}
});

const cache = new Map<string, Entry>();

export const EntriesCacheManager = ({ children }: { children: any }) => {
  const queryClient = useQueryClient();

  const updateCache = (entries: Entry[], skipInvalidation = false) => {
    entries.forEach((e) => {
      if (dmca.some((rx: string) => new RegExp(rx).test(`${e.author}/${e.permlink}`))) {
        e.body = "This post is not available due to a copyright/fraudulent claim.";
        e.title = "";
      }
      cache.set(makePath("", e.author, e.permlink), e);
    });

    if (!skipInvalidation) {
      // Invalidate queries which fetches entry details(only after cache updating)
      entries.forEach((entry) =>
        queryClient.invalidateQueries([
          QueryIdentifiers.ENTRY,
          makePath("", entry.author, entry.permlink)
        ])
      );
    }
    return entries;
  };

  const addReply = (entry: Entry, reply: Entry) => {
    const cached = cache.get(makePath("", entry.author, entry.permlink))!!;

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
        ...cache.get(makePath("", entry.author, entry.permlink))!!,
        children: count
      }
    ]);
  };

  const getByLink = (link: string): Entry | undefined => {
    return cache.get(link);
  };

  const updateVotes = (entry: Entry, votes: EntryVote[], payout: number) => {
    updateCache([
      {
        ...cache.get(makePath("", entry.author, entry.permlink))!!,
        active_votes: votes,
        total_votes: votes.length,
        payout,
        pending_payout_value: String(payout)
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

export function useEntryReFetch(entry: Entry | null) {
  const [key, setKey] = useState("");

  useEffect(() => {
    if (entry) {
      setKey(makePath("", entry.author, entry.permlink));
    }
  }, [entry]);

  return useMutation(
    ["FETCH_ENTRY", key],
    () => bridgeApi.getPost(entry?.author, entry?.permlink),
    {
      onSuccess: (response) => queryClient.setQueryData([QueryIdentifiers.ENTRY, key], response)
    }
  );
}

export function useDeletedEntryCache(author: string, permlink: string) {
  return useQuery(
    [QueryIdentifiers.DELETED_ENTRY, makePath("", author, permlink)],
    async () => {
      const history = await commentHistory(author, permlink);
      const { body, title, tags } = history.list[0];
      return {
        body,
        title,
        tags
      };
    },
    {
      initialData: null,
      refetchOnMount: false
    }
  );
}

export function useEntryCache<T extends Entry>(initialEntry: T): DefinedQueryObserverResult<T>;
export function useEntryCache<T extends Entry>(
  category: string,
  author: string,
  permlink: string
): DefinedQueryObserverResult<T>;
export function useEntryCache<T extends Entry>(
  initialOrPath: T | string,
  author?: string,
  permlink?: string
) {
  const { getByLink, updateCache } = useContext(EntriesCacheContext);
  const { addEntry, updateEntry, entries } = useMappedStore();

  const queryKey =
    typeof initialOrPath === "string"
      ? makePath("", author!!, permlink!!)
      : makePath("", initialOrPath.author, initialOrPath.permlink);

  const query = useQuery(
    [QueryIdentifiers.ENTRY, queryKey],
    async () => {
      let entry = getByLink(queryKey) as T;

      if (!entry) {
        entry = getExistingEntryFromStore() as T;
      }

      if (!entry && typeof initialOrPath === "string") {
        const response = await bridgeApi.getPost(author, permlink);

        // update cache value to getting from there next time
        if (response) {
          updateCache([response]);
        }
        return response;
      } else if (!entry) {
        return updateCache([initialOrPath as T])[0];
      }

      return entry;
    },
    {
      initialData: typeof initialOrPath === "string" ? null : initialOrPath
    }
  );

  useEffect(() => {
    if (query.data) {
      if (getExistingEntryFromStore()) {
        updateEntry(query.data);
      } else {
        addEntry(query.data);
      }
    }
  }, [query.data]);

  const getExistingEntryFromStore = () => {
    const groupKeys = Object.keys(entries);
    let entry: Entry | undefined;

    for (const k of groupKeys) {
      entry = entries[k].entries.find((x) => x.author === author && x.permlink === permlink);
      if (entry) {
        break;
      }
    }

    return entry;
  };

  return query;
}
