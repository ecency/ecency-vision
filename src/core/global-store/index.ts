import { create } from "zustand";
import { combine } from "zustand/middleware";
import { createSubscriptionsActions } from "@/core/global-store/subscriptions-module";
import { INITIAL_STATE } from "@/core/global-store/initial-state";
import { createUiActions } from "@/core/global-store/ui-module";
import { createGlobalActions } from "@/core/global-store/global-module";
import { createUsersActions } from "@/core/global-store/users-module";
import { createActiveUserActions } from "@/core/global-store/active-user-module";
import { createSigningKeyActions } from "@/core/global-store/signing-key-module";
import { createNotificationsActions } from "@/core/global-store/notifications-module";

export const useGlobalStore = create(
  combine(INITIAL_STATE, (set, getState, store) => ({
    ...createUiActions(set, getState),
    ...createSubscriptionsActions(set),
    ...createGlobalActions(set, getState),
    ...createUsersActions(),
    ...createActiveUserActions(set, getState),
    ...createSigningKeyActions(set, getState),
    ...createNotificationsActions(set, getState)
  }))
);
