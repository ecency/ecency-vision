import React, { createContext, PropsWithChildren, useMemo, useRef, useState } from "react";
import { Client } from "@hiveio/dhive";
import useMount from "react-use/lib/useMount";
import { useGetRequestLatency } from "./hive";
import SERVERS from "../constants/servers.json";

export const CoreContext = createContext<{
  hiveClient: Client | undefined;
}>({
  hiveClient: undefined
});

export function CoreProvider(props: PropsWithChildren<unknown>) {
  const hiveClientRef = useRef<Client>();
  const [lastLatency, setLastLatency] = useState(0);

  const { mutateAsync: getRequestLatency } = useGetRequestLatency();

  const hiveClient = useMemo(() => hiveClientRef.current, [hiveClientRef]);

  useMount(async () => {
    let minLatencyServer: [string | undefined, number] = [undefined, Infinity];
    for (const server of SERVERS) {
      try {
        const { latency } = await getRequestLatency(server);
        console.log(server, latency);
        if (latency < minLatencyServer[1]) {
          minLatencyServer = [server, latency];
        }
      } catch (e) {}
    }

    setLastLatency(minLatencyServer[1]);
    hiveClientRef.current = new Client(minLatencyServer[0] ? [minLatencyServer[0]] : SERVERS, {
      timeout: 3000,
      failoverThreshold: 3,
      consoleOnFailover: true
    });
  });

  return <CoreContext.Provider value={{ hiveClient }}>{props.children}</CoreContext.Provider>;
}
