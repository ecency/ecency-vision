import * as bridgeApi from "../../../../api/bridge";
import { ProfileFilter } from "../../../../store/global/types";
import { getDiscussion } from "../../../../api/bridge";
import { ThreadItemEntry, IdentifiableEntry } from "./identifiable-entry";
import { FetchQueryOptions } from "@tanstack/query-core/src/types";

export async function fetchThreads(
  host: string,
  lastContainer?: ThreadItemEntry
): Promise<IdentifiableEntry[]> {
  let nextThreadContainers = (await bridgeApi.getAccountPosts(
    ProfileFilter.posts,
    host,
    lastContainer?.author,
    lastContainer?.permlink,
    1
  )) as IdentifiableEntry[];
  nextThreadContainers = nextThreadContainers?.map((c) => {
    c.id = c.post_id;
    c.host = host;
    return c;
  });

  if (!nextThreadContainers || nextThreadContainers.length === 0) {
    return [];
  }

  const threadItems = await getDiscussion(host, nextThreadContainers[0].permlink);

  // If no discussion need to fetch next container
  if (Object.values(threadItems || {}).length === 1) {
    return fetchThreads(host, nextThreadContainers[0]);
  }

  const flattenThreadItems = Object.values(threadItems ?? {})
    // Filter only parent thread items
    .filter(
      ({ parent_author, parent_permlink }) =>
        parent_author === nextThreadContainers[0].author &&
        parent_permlink === nextThreadContainers[0].permlink
    );

  return flattenThreadItems
    .map((item) => ({
      ...item,
      id: item.post_id,
      host,
      container: nextThreadContainers[0],
      parent: flattenThreadItems.find(
        (i) =>
          i.author === item.parent_author &&
          i.permlink === item.parent_permlink &&
          i.author !== host
      )
    }))
    .filter((i) => i.container.post_id !== i.post_id);
}

export function threadsQuery(...args: Parameters<typeof fetchThreads>): FetchQueryOptions {
  return {
    queryKey: ["threads-query", { ...args }],
    queryFn: () => fetchThreads(...args)
  };
}
