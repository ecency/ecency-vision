import { Entry } from "../store/entries/types";
import { SortOrder } from "../store/discussion/types";
import parseAsset from "../helper/parse-asset";

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
