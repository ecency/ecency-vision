import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveNotificationsSettings } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";
import { NotifyTypes } from "@/enums";
import { QueryIdentifiers } from "@/core/react-query";

export function useUpdateNotificationsSettings() {
  const queryClient = useQueryClient();
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["notifications", "update-settings"],
    mutationFn: ({
      notifyTypes,
      isEnabled,
      token
    }: {
      notifyTypes: NotifyTypes[];
      isEnabled: boolean;
      token: string;
    }) => saveNotificationsSettings(activeUser!.username, notifyTypes, isEnabled, token),
    onSuccess: (settings) => {
      queryClient.setQueryData(
        [QueryIdentifiers.NOTIFICATIONS_SETTINGS, activeUser?.username],
        settings
      );
    }
  });
}
