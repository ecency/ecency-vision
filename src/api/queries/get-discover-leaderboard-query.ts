import { QueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { LeaderBoardDuration, LeaderBoardItem } from "@/entities";
import axios from "axios";
import { apiBase } from "@/api/helper";

export async function prefetchDiscoverLeaderboardQuery(
  queryClient: QueryClient,
  duration: LeaderBoardDuration
) {
  await queryClient.prefetchQuery({
    queryKey: [QueryIdentifiers.DISCOVER_LEADERBOARD, duration],
    queryFn: () =>
      axios
        .get<LeaderBoardItem[]>(apiBase(`/private-api/leaderboard/${duration}`))
        .then((resp) => resp.data)
  });

  return queryClient.getQueryData<LeaderBoardItem[]>([
    QueryIdentifiers.DISCOVER_LEADERBOARD,
    duration
  ]);
}
