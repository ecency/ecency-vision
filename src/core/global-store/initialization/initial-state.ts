import { createGlobalState } from "@/core/global-store/modules/global-module";
import { createAuthenticationState } from "@/core/global-store/modules/authentication-module";
import { createSubscriptionsState } from "@/core/global-store/modules/subscriptions-module";
import { createUiState } from "@/core/global-store/modules/ui-module";
import { createUsersState } from "@/core/global-store/modules/users-module";
import { createSigningKeyState } from "@/core/global-store/modules/signing-key-module";
import { createNotificationsState } from "@/core/global-store/modules/notifications-module";

export const INITIAL_STATE = {
  ...createGlobalState(),
  ...createAuthenticationState(),
  ...createSubscriptionsState(),
  ...createUiState(),
  ...createUsersState(),
  ...createSigningKeyState(),
  ...createNotificationsState()
};

export type GlobalStore = typeof INITIAL_STATE;
