import { useQueries, useQuery } from "@tanstack/react-query";
import { getPoints, getPointTransactions } from "./private-api";
import axios from "axios";
import { catchPostImage } from "@ecency/render-helper";
import { useGlobalStore } from "@/core/global-store";
import { QueryIdentifiers } from "@/core/react-query";
import { Community, DynamicProps, Entry } from "@/entities";
import { getAccountFull, getDynamicProps, getTrendingTags } from "@/api/hive";
import { getCommunities } from "@/api/bridge";

const DEFAULT = {
  points: "0.000",
  uPoints: "0.000",
  transactions: []
};

export function usePointsQuery(username: string, filter = 0) {
  const usePrivate = useGlobalStore((state) => state.usePrivate);

  return useQuery(
    [QueryIdentifiers.POINTS, username, filter],
    async () => {
      const name = username.replace("@", "");

      try {
        const points = await getPoints(name, usePrivate);
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
  const canUseWebp = useGlobalStore((state) => state.canUseWebp);

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
          canUseWebp
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

export function useTrendingTagsQuery() {
  return useQuery([QueryIdentifiers.TRENDING_TAGS], async () => getTrendingTags(), {
    initialData: []
  });
}

export function useDynamicPropsQuery() {
  return useQuery<DynamicProps>([QueryIdentifiers.DYNAMIC_PROPS], async () => getDynamicProps(), {
    initialData: {
      hivePerMVests: 1,
      base: 1,
      quote: 1,
      fundRecentClaims: 1,
      fundRewardBalance: 1,
      hbdPrintRate: 1,
      hbdInterestRate: 1,
      headBlock: 1,
      totalVestingFund: 1,
      totalVestingShares: 1,
      virtualSupply: 1,
      vestingRewardPercent: 1,
      accountCreationFee: "3.000 HIVE"
    }
  });
}

export function useCommunitiesQuery(sort: string, query?: string, initialData: Community[] = []) {
  return useQuery<Community[]>(
    [QueryIdentifiers.COMMUNITIES, sort, query],
    async () => getCommunities("", 100, query ? query : null, sort === "hot" ? "rank" : sort),
    {
      initialData
    }
  );
}
