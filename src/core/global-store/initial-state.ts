import { createGlobalState } from "@/core/global-store/global-module";
import { createActiveUserState } from "@/core/global-store/active-user-module";
import { createSubscriptionsState } from "@/core/global-store/subscriptions-module";
import { createUiState } from "@/core/global-store/ui-module";
import { createUsersState } from "@/core/global-store/users-module";
import { createNotificationsState } from "@/core/global-store/notifications-module";

export const INITIAL_STATE = {
  ...createGlobalState(),
  ...createActiveUserState(),
  ...createSubscriptionsState(),
  ...createUiState(),
  ...createUsersState(),
  ...createNotificationsState()
};

export type GlobalStore = typeof INITIAL_STATE;
