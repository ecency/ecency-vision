import { createContext, useState } from "react";
import React from "react";
import useDebounce from "react-use/lib/useDebounce";
import { ThreadItemEntry } from "./identifiable-entry";
import { fetchThreads } from "./threads-api";
import { fetchThreadsFromCommunity } from "./community-api";

export * from "./identifiable-entry";
export * from "./deck-threads-column-manager";

interface Context {
  register: (id: string) => void;
  detach: (id: string) => void;
  reloadingInitiated: boolean;
  reload: () => void;
}

export const DeckThreadsContext = createContext<Context>({
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
    <DeckThreadsContext.Provider value={{ register, detach, reloadingInitiated, reload }}>
      {children}
    </DeckThreadsContext.Provider>
  );
};
