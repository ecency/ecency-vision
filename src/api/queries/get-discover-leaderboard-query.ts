import { QueryClient, useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { LeaderBoardDuration, LeaderBoardItem } from "@/entities";
import axios from "axios";
import { apiBase } from "@/api/helper";

export async function prefetchDiscoverLeaderboardQuery(
  queryClient: QueryClient,
  duration: LeaderBoardDuration
) {
  return queryClient.prefetchQuery({
    queryKey: [QueryIdentifiers.DISCOVER_LEADERBOARD, duration],
    queryFn: () =>
      axios
        .get<LeaderBoardItem[]>(apiBase(`/private-api/leaderboard/${duration}`))
        .then((resp) => resp.data)
  });
}

export function useDiscoverLeaderboardQuery(duration: LeaderBoardDuration) {
  return useQuery({
    queryKey: [QueryIdentifiers.DISCOVER_LEADERBOARD, duration],
    queryFn: () =>
      axios
        .get<LeaderBoardItem[]>(apiBase(`/private-api/leaderboard/${duration}`))
        .then((resp) => resp.data),
    initialData: []
  });
}
