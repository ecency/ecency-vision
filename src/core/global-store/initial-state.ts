import { createGlobalState } from "@/core/global-store/global-module";
import { createActiveUserState } from "@/core/global-store/active-user-module";
import { createSubscriptionsState } from "@/core/global-store/subscriptions-module";
import { createUiState } from "@/core/global-store/ui-module";
import { createUsersState } from "@/core/global-store/users-module";
import { createNotificationsState } from "@/core/global-store/notifications-module";
import { createSigningKeyState } from "@/core/global-store/signing-key-module";

export const INITIAL_STATE = {
  ...createGlobalState(),
  ...createActiveUserState(),
  ...createSubscriptionsState(),
  ...createUiState(),
  ...createUsersState(),
  ...createNotificationsState(),
  ...createSigningKeyState()
};

export type GlobalStore = typeof INITIAL_STATE;
