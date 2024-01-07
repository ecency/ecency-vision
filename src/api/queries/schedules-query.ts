import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { useGlobalStore } from "@/core/global-store";
import { getSchedules } from "@/api/private-api";

export function useSchedulesQuery() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.SCHEDULES, activeUser?.username],
    queryFn: () => getSchedules(activeUser!.username),
    enabled: !!activeUser,
    initialData: []
  });
}
