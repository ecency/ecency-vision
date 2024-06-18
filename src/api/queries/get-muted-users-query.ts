import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { client } from "@/api/hive";
import { ActiveUser, Follow } from "@/entities";

export const getMutedUsersQuery = (activeUser: ActiveUser | null, limit = 100) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.MUTED_USERS, activeUser?.username],
    queryFn: async () => {
      const response = (await client.database.call("get_following", [
        activeUser?.username,
        "",
        "ignore",
        limit
      ])) as Follow[];

      return response.map((user) => user.following);
    }
  });
