import { useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { EntriesCacheContext, QueryIdentifiers } from "../core";
import {
  getBoostPlusAccounts,
  getBoostPlusPrice,
  getPoints,
  getPointTransactions
} from "./private-api";
import { useMappedStore } from "../store/use-mapped-store";
import axios from "axios";
import { catchPostImage } from "@ecency/render-helper";
import { Entry } from "../store/entries/types";
import { getAccountFull, getFollowing } from "./hive";
import { getAccountPosts, getDiscussion } from "./bridge";
import { SortOrder } from "../store/discussion/types";
import { useContext, useState } from "react";
import { sortDiscussions } from "../util/sort-discussions";
import { apiBase } from "./helper";
import useDebounce from "react-use/lib/useDebounce";

const DEFAULT = {
  points: "0.000",
  uPoints: "0.000",
  transactions: []
};

export function usePointsQuery(username: string, filter = 0) {
  const { global } = useMappedStore();

  return useQuery(
    [QueryIdentifiers.POINTS, username, filter],
    async () => {
      const name = username.replace("@", "");

      try {
        const points = await getPoints(name, global.usePrivate);
        const transactions = await getPointTransactions(name, filter);
        return {
          points: points.points,
          uPoints: points.unclaimed_points,
          transactions
        };
      } catch (e) {
        return DEFAULT;
      }
    },
    {
      initialData: DEFAULT,
      retryDelay: 30000
    }
  );
}

export function useImageDownloader(
  entry: Entry,
  noImage: string,
  width: number,
  height: number,
  enabled: boolean
) {
  const { global } = useMappedStore();

  const blobToBase64 = (blob: Blob) => {
    const reader = new FileReader();

    reader.readAsDataURL(blob);

    return new Promise((resolve, reject) => {
      reader.onloadend = function () {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = function (e) {
        reject(e);
      };
    });
  };

  return useQuery(
    [QueryIdentifiers.ENTRY_THUMB, entry.author, entry.permlink, width, height],
    async () => {
      try {
        const response = await axios.get(
          global.canUseWebp
            ? catchPostImage(entry, width, height, "webp")
            : catchPostImage(entry, width, height) || noImage,
          {
            responseType: "blob"
          }
        );

        return (await blobToBase64(response.data)) as string;
      } catch (e) {
        return noImage;
      }
    },
    {
      enabled,
      retryDelay: 3000
    }
  );
}

export function useGetAccountFullQuery(username?: string) {
  return useQuery([QueryIdentifiers.GET_ACCOUNT_FULL, username], () => getAccountFull(username!), {
    enabled: !!username
  });
}

export function useGetAccountsFullQuery(usernames: string[]) {
  return useQueries({
    queries: usernames.map((username) => ({
      queryKey: [QueryIdentifiers.GET_ACCOUNT_FULL, username],
      queryFn: () => getAccountFull(username!),
      enabled: !!username
    }))
  });
}

export function useGetAccountPostsQuery(username?: string) {
  return useQuery({
    queryKey: [QueryIdentifiers.GET_POSTS, username],
    queryFn: () => getAccountPosts("posts", username!).then((response) => response ?? []),
    enabled: !!username,
    initialData: []
  });
}

export function useFetchDiscussionsQuery(
  entry: Entry,
  order: SortOrder,
  queryOptions?: UseQueryOptions<Entry[]>
) {
  const { updateCache } = useContext(EntriesCacheContext);

  return useQuery<Entry[]>(
    [QueryIdentifiers.FETCH_DISCUSSIONS, entry?.author, entry?.permlink],
    async () => {
      const response = await getDiscussion(entry.author, entry.permlink);
      if (response) {
        const entries = Array.from(Object.values(response));
        updateCache([...entries], true);
        return entries;
      }
      return [];
    },
    {
      ...queryOptions,
      initialData: [],
      select: (data) => sortDiscussions(entry, data, order)
    }
  );
}

export function useFetchMutedUsersQuery(username?: string) {
  const { activeUser } = useMappedStore();

  return useQuery(
    [QueryIdentifiers.FETCH_MUTED_USERS, username ?? activeUser?.username ?? "anon"],
    async () => {
      const response = await getFollowing(username ?? activeUser!!.username, "", "ignore", 100);
      return response.map((user) => user.following);
    },
    {
      initialData: [],
      enabled: !!username || !!activeUser
    }
  );
}

export function useBotsQuery() {
  return useQuery({
    queryKey: [QueryIdentifiers.GET_BOTS],
    queryFn: () =>
      axios.get<string[]>(apiBase("/private-api/public/bots")).then((resp) => resp.data),
    initialData: []
  });
}

export function useGetBoostPlusPricesQuery() {
  const { activeUser } = useMappedStore();
  return useQuery({
    queryKey: [QueryIdentifiers.GET_BOOST_PLUS_PRICES],
    queryFn: () => getBoostPlusPrice(activeUser!.username),
    initialData: []
  });
}

export function useGetBoostPlusAccountPricesQuery(account: string) {
  const { activeUser } = useMappedStore();

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
    queryFn: () =>
      getBoostPlusAccounts(activeUser!.username, query).then((data) =>
        data
          ? ({
              ...data,
              expires: new Date(data.expires)
            } as { account?: string; expires?: Date })
          : {}
      ),
    initialData: {},
    enabled: !!query
  });
}
