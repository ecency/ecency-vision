import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveNotificationsSettings } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";
import { NotifyTypes } from "@/enums";
import { QueryIdentifiers } from "@/core/react-query";
import * as ls from "@/utils/local-storage";

export function useUpdateNotificationsSettings() {
  const queryClient = useQueryClient();
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["notifications", "update-settings"],
    mutationFn: ({ notifyTypes, isEnabled }: { notifyTypes: NotifyTypes[]; isEnabled: boolean }) =>
      saveNotificationsSettings(
        activeUser!.username,
        notifyTypes,
        isEnabled,
        ls.get("fb-notifications-token")
      ),
    onSuccess: (settings) => {
      queryClient.setQueryData(
        [QueryIdentifiers.NOTIFICATIONS_SETTINGS, activeUser?.username],
        settings
      );
    }
  });
}
