import SERVERS from "../../constants/servers.json";
import { useGetRequestLatency } from "./get-request-latency";
import useDebounce from "react-use/lib/useDebounce";

export function useFindNearHiveServer(
  isFind: boolean,
  onFind?: (server: string | undefined, latency: number) => void
) {
  const { mutateAsync: getRequestLatency } = useGetRequestLatency();

  useDebounce(
    async () => {
      if (!isFind) {
        return;
      }

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
    },
    100,
    [isFind]
  );
}
