import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { useGlobalStore } from "@/core/global-store";
import { client } from "@/api/hive";
import { Follow } from "@/entities";

export function useGetMutedUsersQuery(limit = 100) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useQuery({
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
}
