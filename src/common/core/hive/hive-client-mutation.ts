import { MutationOptions, useMutation } from "@tanstack/react-query";
import { useMappedStore } from "../../store/use-mapped-store";
import { useContext } from "react";
import { CoreContext } from "../core-provider";
import { NoHiveClientError } from "./errors";
import { HiveResponseWithLatency } from "./types";
import axios from "axios";

export function useHiveClientMutation<DATA>(
  api: string,
  method: string,
  options: MutationOptions<HiveResponseWithLatency<DATA>>
) {
  const { activeUser } = useMappedStore();
  const { hiveClient, setLastLatency } = useContext(CoreContext);

  return useMutation<HiveResponseWithLatency<DATA>>(
    ["hive", activeUser?.username, api, method],
    async (params?: any) => {
      if (!hiveClient) {
        throw new NoHiveClientError();
      }

      const startDate = new Date();
      const response = await hiveClient.call(api, method, params);
      const endDate = new Date();

      return {
        response,
        latency: endDate.getTime() - startDate.getTime() // in ms
      };
    },
    {
      ...options,
      onSuccess: (data, variables, context) => {
        setLastLatency(data.latency);
        options?.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
          setLastLatency(Infinity);
        }
        options?.onError?.(error, variables, context);
      }
    }
  );
}
