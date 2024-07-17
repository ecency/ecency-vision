import { useGlobalStore } from "@/core/global-store";
import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getPoints, getPointTransactions } from "@/api/private-api";

const DEFAULT = {
  points: "0.000",
  uPoints: "0.000",
  transactions: []
};

export const getPointsQuery = (username?: string, filter = 0) => {
  const usePrivate = useGlobalStore((state) => state.usePrivate);

  return EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.POINTS, username, filter],
    queryFn: async () => {
      if (!username) {
        throw new Error("Get points query – username wasn`t provided");
      }

      const name = username.replace("@", "");

      const points = await getPoints(name, usePrivate);
      const transactions = await getPointTransactions(name, filter);
      return {
        points: points.points,
        uPoints: points.unclaimed_points,
        transactions
      } as const;
    },
    initialData: DEFAULT,
    enabled: !!username,
    retryDelay: 30000
  });
};
