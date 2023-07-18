import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "../core";
import { getPoints, getPointTransactions } from "./private-api";
import { useMappedStore } from "../store/use-mapped-store";

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
      initialData: DEFAULT
    }
  );
}
