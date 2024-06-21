"use client";

import { useGlobalStore } from "@/core/global-store";
import { useState } from "react";
import { useDebounce } from "react-use";
import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getAccessToken } from "@/utils";
import axios from "axios";
import { apiBase } from "@/api/helper";

export function useGetBoostPlusAccountPricesQuery(account: string) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [query, setQuery] = useState("");

  useDebounce(
    () => {
      if (account) {
        setQuery(account);
      }
    },
    300,
    [account]
  );

  return useQuery({
    queryKey: [QueryIdentifiers.GET_BOOST_PLUS_ACCOUNTS, query],
    queryFn: async () => {
      if (!activeUser) {
        return {};
      }

      const data = { code: getAccessToken(activeUser?.username), account };
      const response = await axios.post<{
        expires: string;
        account: string;
      }>(apiBase("/private-api/boosted-plus-account"), data);
      const responseData = response.data;
      return responseData
        ? ({
            ...data,
            expires: new Date(responseData.expires)
          } as { account?: string; expires?: Date })
        : {};
    },
    initialData: {},
    enabled: !!query
  });
}
