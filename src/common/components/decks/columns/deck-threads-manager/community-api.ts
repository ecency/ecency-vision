import { IdentifiableEntry, ThreadItemEntry } from "./identifiable-entry";
import * as bridgeApi from "../../../../api/bridge";

export async function fetchThreadsFromCommunity(
  host: string,
  community: string,
  lastContainer?: ThreadItemEntry
): Promise<ThreadItemEntry[]> {
  let threadItems = (await bridgeApi.getPostsRanked(
    "created",
    lastContainer?.author,
    lastContainer?.permlink,
    50,
    community
  )) as IdentifiableEntry[];

  threadItems = threadItems.map((item) => {
    const titleEnd = item.title.slice(item.title.length - 4, item.title.length);
    const bodyStart = item.body.slice(0, 4);
    if (titleEnd === " ..." && bodyStart === "... ") {
      item.body = `${item.title.slice(0, item.title.length - 4)}${item.body.slice(
        4,
        item.body.length
      )}`;
    }

    return {
      ...item,
      id: item.post_id,
      host
    };
  });

  threadItems = threadItems.map((item) => ({
    ...item,
    container: threadItems[threadItems.length - 1]
  }));

  return threadItems;
}
