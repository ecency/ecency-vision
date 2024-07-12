import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { Follow } from "@/entities";

export const getFollowingQuery = (
  follower: string | undefined,
  startFollowing: string,
  followType = "blog",
  limit = 100
) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_FOLLOWING, startFollowing],
    queryFn: () =>
      client.database.call("get_following", [
        follower,
        startFollowing,
        followType,
        limit
      ]) as Promise<Follow[]>,
    enabled: !!follower
  });
