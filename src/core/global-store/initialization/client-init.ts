"use client";

import { create } from "zustand";
import { combine } from "zustand/middleware";
import { INITIAL_STATE } from "@/core/global-store/initialization/initial-state";
import { createUiActions } from "@/core/global-store/modules/ui-module";
import { createSubscriptionsActions } from "@/core/global-store/modules/subscriptions-module";
import { createGlobalActions } from "@/core/global-store/modules/global-module";
import { createUsersActions } from "@/core/global-store/modules/users-module";
import { createAuthenticationActions } from "@/core/global-store/modules/authentication-module";
import { createSigningKeyActions } from "@/core/global-store/modules/signing-key-module";
import { createNotificationsActions } from "@/core/global-store/modules/notifications-module";

export const useClientGlobalStore = create(
  combine(INITIAL_STATE, (set, getState, store) => ({
    ...createUiActions(set, getState),
    ...createSubscriptionsActions(set),
    ...createGlobalActions(set, getState),
    ...createUsersActions(),
    ...createAuthenticationActions(set, getState),
    ...createSigningKeyActions(set, getState),
    ...createNotificationsActions(set, getState)
  }))
);
