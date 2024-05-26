import { QueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { LeaderBoardDuration, LeaderBoardItem } from "@/entities";
import { apiBase } from "@/api/helper";
import { appAxios } from "@/api/axios";

export async function prefetchDiscoverLeaderboardQuery(
  queryClient: QueryClient,
  duration: LeaderBoardDuration
) {
  await queryClient.prefetchQuery({
    queryKey: [QueryIdentifiers.DISCOVER_LEADERBOARD, duration],
    queryFn: () =>
      appAxios
        .get<LeaderBoardItem[]>(apiBase(`/private-api/leaderboard/${duration}`))
        .then((resp) => resp.data)
  });

  return queryClient.getQueryData<LeaderBoardItem[]>([
    QueryIdentifiers.DISCOVER_LEADERBOARD,
    duration
  ]);
}
