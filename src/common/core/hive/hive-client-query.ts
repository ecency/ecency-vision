import { useContext } from "react";
import { CoreContext } from "../core-provider";
import { MutationOptions, QueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { useMappedStore } from "../../store/use-mapped-store";

export function useHiveClientMutation<DATA>(
  api: string,
  method: string,
  options: MutationOptions<DATA>
) {
  const { activeUser } = useMappedStore();
  const { hiveClient } = useContext(CoreContext);

  return useMutation<DATA>(
    ["hive", activeUser?.username, api, method],
    async (params?: any) => {
      if (!hiveClient) {
        return undefined;
      }

      return hiveClient.call(api, method, params);
    },
    options
  );
}

export function useHiveClientQuery<DATA>(api: string, method: string, options: QueryOptions<DATA>) {
  const { activeUser } = useMappedStore();
  const { hiveClient } = useContext(CoreContext);

  return useQuery<DATA>(
    ["hive", activeUser?.username, api, method],
    async (params?: any) => {
      if (!hiveClient) {
        return undefined;
      }

      return hiveClient.call(api, method, params);
    },
    { ...options, enabled: !!hiveClient }
  );
}
