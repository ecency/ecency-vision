import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { getFavorites } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";

export function useFavouritesQuery() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.FAVOURITES, activeUser?.username],
    queryFn: () => getFavorites(activeUser!.username),
    enabled: !!activeUser,
    initialData: []
  });
}
