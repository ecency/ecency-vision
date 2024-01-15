import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import { useGlobalStore } from "@/core/global-store";
import { getNotificationSetting } from "@/api/private-api";
import * as ls from "@/utils/local-storage";
import { NotifyTypes } from "@/enums";
import { ApiNotificationSetting } from "@/entities";

export function useNotificationsSettingsQuery() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useQuery({
    queryKey: [QueryIdentifiers.NOTIFICATIONS_SETTINGS, activeUser?.username],
    queryFn: () => {
      let token = activeUser?.username + "-web";
      let oldToken = ls.get("fb-notifications-token");
      return getNotificationSetting(activeUser!.username, oldToken || token);
    },
    enabled: !!activeUser,
    refetchOnMount: false,
    initialData: () => {
      const wasMutedPreviously = ls.get("notifications") === false;
      return {
        status: 0,
        system: "web",
        allows_notify: 0,
        notify_types: wasMutedPreviously
          ? []
          : ([
              NotifyTypes.COMMENT,
              NotifyTypes.FOLLOW,
              NotifyTypes.MENTION,
              NotifyTypes.FAVORITES,
              NotifyTypes.BOOKMARKS,
              NotifyTypes.VOTE,
              NotifyTypes.RE_BLOG,
              NotifyTypes.TRANSFERS
            ] as number[])
      } as ApiNotificationSetting;
    }
  });
}
