import React, { createContext, PropsWithChildren } from "react";
import useMap from "react-use/lib/useMap";

export const NostrListenerQueriesContext = createContext<{
  subscribers: Record<string, boolean>;
  set: (key: string, value: boolean) => void;
  get: (key: string) => boolean;
}>({
  subscribers: {},
  set: () => {},
  get: () => false
});

export function NostrListenerQueriesProvider({ children }: PropsWithChildren<unknown>) {
  const [subscribers, { set, get }] = useMap<Record<string, boolean>>();

  return (
    <NostrListenerQueriesContext.Provider value={{ subscribers, set, get }} children={children} />
  );
}
