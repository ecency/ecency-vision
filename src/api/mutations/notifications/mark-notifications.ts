import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotifications } from "@/api/private-api";
import { QueryIdentifiers } from "@/core/react-query";
import { useGlobalStore } from "@/core/global-store";

export function useMarkNotifications() {
  const queryClient = useQueryClient();
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["notifications", "mark"],
    mutationFn: ({ id }: { id: string | undefined }) => markNotifications(activeUser!.username, id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [QueryIdentifiers.NOTIFICATIONS_UNREAD_COUNT, activeUser?.username]
      })
  });
}
