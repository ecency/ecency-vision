import { createStore } from "zustand";
import { combine } from "zustand/middleware";
import { INITIAL_STATE } from "@/core/global-store/initialization/initial-state";
import { createUiActions } from "@/core/global-store/modules/ui-module";
import { createSubscriptionsActions } from "@/core/global-store/modules/subscriptions-module";
import { createGlobalActions } from "@/core/global-store/modules/global-module";
import { createUsersActions } from "@/core/global-store/modules/users-module";
import { createAuthenticationActions } from "@/core/global-store/modules/authentication-module";
import { createSigningKeyActions } from "@/core/global-store/modules/signing-key-module";
import { createNotificationsActions } from "@/core/global-store/modules/notifications-module";

type FINAL_STATE = typeof INITIAL_STATE &
  ReturnType<typeof createUiActions> &
  ReturnType<typeof createSubscriptionsActions> &
  ReturnType<typeof createGlobalActions> &
  ReturnType<typeof createUsersActions> &
  ReturnType<typeof createAuthenticationActions> &
  ReturnType<typeof createSigningKeyActions> &
  ReturnType<typeof createNotificationsActions>;

const getServerStore = () =>
  createStore(
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

export function useServerGlobalStore<T>(fn: (store: FINAL_STATE) => T): T {
  return fn(getServerStore().getState() as any);
}
