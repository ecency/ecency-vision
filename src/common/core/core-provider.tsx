import React, { createContext, PropsWithChildren, useState } from "react";
import { Client } from "@hiveio/dhive";
import { useFindNearHiveServer } from "./hive";
import SERVERS from "../constants/servers.json";

export const CoreContext = createContext<{
  hiveClient: Client | undefined;
  lastLatency: number;
  server: string;
  setLastLatency: (v: number) => void;
  setFindNearHiveServer: (v: boolean) => void;
}>({
  lastLatency: 0,
  server: "",
  hiveClient: undefined,
  setLastLatency: () => {},
  setFindNearHiveServer: () => {}
});

export function CoreProvider(props: PropsWithChildren<unknown>) {
  const [hiveClient, setHiveClient] = useState<Client | undefined>(undefined);
  const [lastLatency, setLastLatency] = useState(0);
  const [server, setServer] = useState("");
  const [findNearHiveServer, setFindNearHiveServer] = useState(true);

  useFindNearHiveServer(findNearHiveServer, (server, latency) => {
    if (server) {
      setServer(server);
    }
    setLastLatency(latency);
    setHiveClient(
      new Client(server ?? SERVERS, {
        timeout: 3000,
        failoverThreshold: 3,
        consoleOnFailover: true
      })
    );
    setFindNearHiveServer(false);
  });

  return (
    <CoreContext.Provider
      value={{ hiveClient, lastLatency, setFindNearHiveServer, setLastLatency, server }}
    >
      {props.children}
    </CoreContext.Provider>
  );
}
