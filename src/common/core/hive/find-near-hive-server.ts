import useMount from "react-use/lib/useMount";
import SERVERS from "../../constants/servers.json";
import { useGetRequestLatency } from "./get-request-latency";

export function useFindNearHiveServer(
  onFind?: (server: string | undefined, latency: number) => void
) {
  const { mutateAsync: getRequestLatency } = useGetRequestLatency();

  useMount(async () => {
    let minLatencyServer: [string | undefined, number] = [undefined, Infinity];
    for (const server of SERVERS) {
      try {
        const { latency } = await getRequestLatency(server);
        if (latency < minLatencyServer[1]) {
          minLatencyServer = [server, latency];
        }
      } catch (e) {}
    }

    onFind?.(minLatencyServer[0], minLatencyServer[1]);
  });
}
