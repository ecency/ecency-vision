import { EcencyQueriesManager, getQueryClient, QueryIdentifiers } from "@/core/react-query";
import { Entry } from "@/entities";
import { bridgeApiCall } from "@/api/bridge";
import { parseAsset } from "@/utils";
import { SortOrder } from "@/enums";
import { IdentifiableEntry } from "@/app/decks/_components/columns/deck-threads-manager";
import { EcencyEntriesCacheManagement } from "@/core/caches";

export function sortDiscussions(entry: Entry, discussion: Entry[], order: SortOrder) {
  const allPayout = (c: Entry) =>
    parseAsset(c.pending_payout_value).amount +
    parseAsset(c.author_payout_value).amount +
    parseAsset(c.curator_payout_value).amount;

  const absNegative = (a: Entry) => a.net_rshares < 0;
  const isPinned = (a: Entry) => entry.json_metadata.pinned_reply === `${a.author}/${a.permlink}`;

  const sortOrders = {
    trending: (a: Entry, b: Entry) => {
      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const _a = allPayout(a);
      const _b = allPayout(b);
      if (_a !== _b) {
        return _b - _a;
      }

      return 0;
    },
    author_reputation: (a: Entry, b: Entry) => {
      const keyA = a.author_reputation;
      const keyB = b.author_reputation;

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;

      return 0;
    },
    votes: (a: Entry, b: Entry) => {
      const keyA = a.children;
      const keyB = b.children;

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;

      return 0;
    },
    created: (a: Entry, b: Entry) => {
      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const keyA = Date.parse(a.created);
      const keyB = Date.parse(b.created);

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;

      return 0;
    }
  };

  const sorted = discussion.sort(sortOrders[order]);
  const pinnedIndex = sorted.findIndex((i) => isPinned(i));
  const pinned = sorted[pinnedIndex];
  if (pinnedIndex >= 0) {
    sorted.splice(pinnedIndex, 1);
    sorted.unshift(pinned);
  }
  return sorted;
}

export const getDiscussionsQuery = (entry: Entry, order: SortOrder, enabled: boolean = true) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.FETCH_DISCUSSIONS, entry?.author, entry?.permlink],
    queryFn: async () => {
      const response = await bridgeApiCall<Record<string, Entry> | null>("get_discussion", {
        author: entry.author,
        permlink: entry.permlink
      });
      if (response) {
        const entries = Array.from(Object.values(response));
        EcencyEntriesCacheManagement.updateEntryQueryData([...entries]);
        return entries;
      }
      return [];
    },
    enabled,
    initialData: [],
    select: (data) => sortDiscussions(entry, data, order)
  });

export const getDiscussionsMapQuery = (entry: Entry | undefined, enabled: boolean = true) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.FETCH_DISCUSSIONS_MAP, entry?.author, entry?.permlink],
    queryFn: async () => {
      const response = await bridgeApiCall<Record<string, IdentifiableEntry> | null>(
        "get_discussion",
        {
          author: entry!!.author,
          permlink: entry!!.permlink
        }
      );
      if (response) {
        const entries = Array.from(Object.values(response));
        EcencyEntriesCacheManagement.updateEntryQueryData([...entries]);
        return response;
      }
      return {};
    },
    enabled: enabled && !!entry,
    initialData: {}
  });

export function addReplyToDiscussionsList(entry: IdentifiableEntry, reply: Entry) {
  getQueryClient().setQueryData<Record<string, Entry | null>>(
    [QueryIdentifiers.FETCH_DISCUSSIONS_MAP, entry?.author, entry?.permlink],
    (data) => {
      if (!data) {
        return data;
      }

      return {
        ...data,
        [`${reply.author}/${reply.permlink}`]: reply
      };
    }
  );
}
