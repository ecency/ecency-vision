import React, { createContext, PropsWithChildren, useMemo, useRef, useState } from "react";
import { Client } from "@hiveio/dhive";
import { useFindNearHiveServer } from "./hive";
import SERVERS from "../constants/servers.json";

export const CoreContext = createContext<{
  hiveClient: Client | undefined;
  lastLatency: number;
  server: string;
  setLastLatency: (v: number) => void;
}>({
  lastLatency: 0,
  server: "",
  hiveClient: undefined,
  setLastLatency: () => {}
});

export function CoreProvider(props: PropsWithChildren<unknown>) {
  const hiveClientRef = useRef<Client>();

  const [lastLatency, setLastLatency] = useState(0);
  const [server, setServer] = useState("");

  const hiveClient = useMemo(() => hiveClientRef.current, [hiveClientRef.current]);

  useFindNearHiveServer((server, latency) => {
    if (server) {
      setServer(server);
    }
    setLastLatency(latency);
    hiveClientRef.current = new Client(server ?? SERVERS, {
      timeout: 3000,
      failoverThreshold: 3,
      consoleOnFailover: true
    });
  });

  return (
    <CoreContext.Provider value={{ hiveClient, lastLatency, setLastLatency, server }}>
      {props.children}
    </CoreContext.Provider>
  );
}
