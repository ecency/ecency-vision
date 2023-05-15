import { Entry } from "../../../store/entries/types";
import { createContext } from "react";
import React from "react";
import * as bridgeApi from "../../../api/bridge";
import { ProfileFilter } from "../../../store/global/types";
import { getDiscussion } from "../../../api/bridge";

interface Context {
  fetch: (hosts: string[], lastContainers?: ThreadItemEntry[]) => Promise<ThreadItemEntry[]>;
}

interface ThreadItemEntry extends Entry {
  host: string;
  container: IdentifiableEntry;
  // Is this entry had been replied to another one
  parent?: Entry;
}

export type IdentifiableEntry = ThreadItemEntry & Required<Pick<Entry, "id">>;

export const DeckThreadsContext = createContext<Context>({
  fetch: async () => []
});

export const DeckThreadsManager = ({ children }: { children: JSX.Element }) => {
  /**
   *
   * @param hosts Thread hosts usernames
   * @param lastContainers Last thread containers post
   */
  const fetch = async (hosts: string[], lastContainers?: ThreadItemEntry[]) => {
    let nextThreadItems: ThreadItemEntry[] = [];

    let usingHosts = lastContainers
      ? hosts.filter((h) => lastContainers.find((c) => c.host === h))
      : hosts;

    for (const host of usingHosts) {
      const lastContainer = lastContainers?.find((c) => c.host === host);
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
        continue;
      }

      const threadItems = await getDiscussion(host, nextThreadContainers[0].permlink);
      console.log(threadItems, nextThreadContainers[0]);
      const flattenThreadItems = Object.values(threadItems ?? {})
        // Filter only parent thread items
        .filter(
          ({ parent_author, parent_permlink }) =>
            parent_author === nextThreadContainers[0].author &&
            parent_permlink === nextThreadContainers[0].permlink
        );

      nextThreadItems = [
        ...nextThreadItems,
        ...flattenThreadItems
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
          .filter((i) => i.container.post_id !== i.post_id)
      ];
    }

    return nextThreadItems;
  };

  return <DeckThreadsContext.Provider value={{ fetch }}>{children}</DeckThreadsContext.Provider>;
};
