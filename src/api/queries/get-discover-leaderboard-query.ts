import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { LeaderBoardDuration, LeaderBoardItem } from "@/entities";
import { apiBase } from "@/api/helper";
import { appAxios } from "@/api/axios";

export const getDiscoverLeaderboardQuery = (duration: LeaderBoardDuration) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.DISCOVER_LEADERBOARD, duration],
    queryFn: () =>
      appAxios
        .get<LeaderBoardItem[]>(apiBase(`/private-api/leaderboard/${duration}`))
        .then((resp) => resp.data)
  });
