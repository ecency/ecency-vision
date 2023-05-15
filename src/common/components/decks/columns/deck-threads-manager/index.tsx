import { createContext, useState } from "react";
import React from "react";
import useDebounce from "react-use/lib/useDebounce";
import { ThreadItemEntry } from "./identifiable-entry";
import { fetchThreads } from "./threads-api";
import { fetchThreadsFromCommunity } from "./community-api";

export * from "./identifiable-entry";

interface Context {
  fetch: (hosts: string[], lastContainers?: ThreadItemEntry[]) => Promise<ThreadItemEntry[]>;
  register: (id: string) => void;
  detach: (id: string) => void;
  reloadingInitiated: boolean;
  reload: () => void;
}

export const DeckThreadsContext = createContext<Context>({
  fetch: async () => [],
  register: () => {},
  detach: () => {},
  reloadingInitiated: false,
  reload: () => {}
});

export const DeckThreadsManager = ({ children }: { children: JSX.Element }) => {
  // Thread columns identifiers
  const [registeredColumns, setRegisteredColumns] = useState<string[]>([]);
  const [reloadingInitiated, setReloadingInitiated] = useState(false);

  useDebounce(() => {
    setReloadingInitiated(false);
  }, 100);

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
      let response;
      if ("dbuzz" === host) {
        response = await fetchThreadsFromCommunity(host, "hive-193084", lastContainer);
      } else {
        response = await fetchThreads(host, lastContainer);
      }

      nextThreadItems = [...nextThreadItems, ...response];
    }

    return nextThreadItems;
  };

  const register = (id: string) => {
    setRegisteredColumns(Array.from(new Set([...registeredColumns, id]).values()));
  };

  const detach = (id: string) => {
    setRegisteredColumns(registeredColumns.filter((c) => c !== id));
  };

  const reload = () => {
    setReloadingInitiated(true);
  };

  return (
    <DeckThreadsContext.Provider value={{ fetch, register, detach, reloadingInitiated, reload }}>
      {children}
    </DeckThreadsContext.Provider>
  );
};
