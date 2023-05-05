import { Entry } from "../../../store/entries/types";
import { createContext } from "react";
import React from "react";
import * as hive from "../../../api/hive";
import * as bridgeApi from "../../../api/bridge";
import { ProfileFilter } from "../../../store/global/types";
import { error } from "../../feedback";
import { _t } from "../../../i18n";
import { getDiscussion } from "../../../api/bridge";

interface Context {
  fetch: (hosts: string[], lastContainers?: ThreadItemEntry[]) => Promise<ThreadItemEntry[]>;
}

interface ThreadItemEntry extends Entry {
  host: string;
  container: IdentifiableEntry;
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

      nextThreadItems = [
        ...nextThreadItems,
        ...Object.values(threadItems ?? {})
          .map((i) => ({
            ...i,
            id: i.post_id,
            host,
            container: nextThreadContainers[0]
          }))
          .filter((i) => i.container.post_id !== i.post_id)
      ];
    }

    return nextThreadItems;
  };

  return <DeckThreadsContext.Provider value={{ fetch }}>{children}</DeckThreadsContext.Provider>;
};
