import { useContext, useEffect } from "react";
import { CoreContext } from "../core-provider";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useMappedStore } from "../../store/use-mapped-store";
import { Client } from "@hiveio/dhive";
import { NoHiveClientError } from "./errors";
import { HiveResponseWithLatency } from "./types";
import axios from "axios";

export function useHiveClientQuery<DATA>(
  api: string,
  method: string,
  initialParams: Parameters<typeof Client.call>[2],
  options?: UseQueryOptions<HiveResponseWithLatency<DATA>>
) {
  const { activeUser } = useMappedStore();
  const { hiveClient, setLastLatency } = useContext(CoreContext);

  const query = useQuery<HiveResponseWithLatency<DATA>>(
    ["hive", activeUser?.username, api, method, initialParams],
    async () => {
      if (!hiveClient) {
        throw new NoHiveClientError();
      }

      const startDate = new Date();
      const response = await hiveClient.call(api, method, initialParams);
      const endDate = new Date();

      return {
        response,
        latency: endDate.getTime() - startDate.getTime() // in ms
      };
    },
    {
      ...options,
      enabled: !!hiveClient
    }
  );

  useEffect(() => {
    if (query.status === "success") {
      setLastLatency(query.data.latency);
    } else if (query.status === "error" && axios.isAxiosError(query.error)) {
      if (query.error.code === "ECONNABORTED") {
        setLastLatency(Infinity);
      }
    }
  }, [query.status, query.data, query.error]);

  return query;
}
