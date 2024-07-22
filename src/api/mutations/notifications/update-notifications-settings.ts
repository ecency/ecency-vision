import { useMutation } from "@tanstack/react-query";
import { saveNotificationsSettings } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";
import { NotifyTypes } from "@/enums";
import { getQueryClient, QueryIdentifiers } from "@/core/react-query";
import * as ls from "@/utils/local-storage";
import { error, success } from "@/features/shared";
import i18next from "i18next";
import { formatError } from "@/api/operations";

export function useUpdateNotificationsSettings() {
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
    onError: (e) => error(...formatError(e)),
    onSuccess: (settings) => {
      success(i18next.t("preferences.updated"));
      getQueryClient().setQueryData(
        [QueryIdentifiers.NOTIFICATIONS_SETTINGS, activeUser?.username],
        settings
      );
    }
  });
}
