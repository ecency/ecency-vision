import { createStore } from "zustand";
import { combine } from "zustand/middleware";
import { INITIAL_STATE } from "@/core/global-store/initial-state";
import { createUiActions } from "@/core/global-store/ui-module";
import { createSubscriptionsActions } from "@/core/global-store/subscriptions-module";
import { createGlobalActions } from "@/core/global-store/global-module";
import { createUsersActions } from "@/core/global-store/users-module";
import { createActiveUserActions } from "@/core/global-store/active-user-module";
import { createSigningKeyActions } from "@/core/global-store/signing-key-module";
import { createNotificationsActions } from "@/core/global-store/notifications-module";

type FINAL_STATE = typeof INITIAL_STATE &
  ReturnType<typeof createUiActions> &
  ReturnType<typeof createSubscriptionsActions> &
  ReturnType<typeof createGlobalActions> &
  ReturnType<typeof createUsersActions> &
  ReturnType<typeof createActiveUserActions> &
  ReturnType<typeof createSigningKeyActions> &
  ReturnType<typeof createNotificationsActions>;

const serverStore = createStore(
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

export function useServerGlobalStore<T>(fn: (store: FINAL_STATE) => T): T {
  return fn(serverStore.getState() as any);
}
