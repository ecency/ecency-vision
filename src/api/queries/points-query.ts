import { useGlobalStore } from "@/core/global-store";
import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getPoints, getPointTransactions } from "@/api/private-api";

const DEFAULT = {
  points: "0.000",
  uPoints: "0.000",
  transactions: []
};

export function usePointsQuery(username: string, filter = 0) {
  const usePrivate = useGlobalStore((state) => state.usePrivate);

  return useQuery({
    queryKey: [QueryIdentifiers.POINTS, username, filter],
    queryFn: async () => {
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
    initialData: DEFAULT,
    retryDelay: 30000
  });
}
