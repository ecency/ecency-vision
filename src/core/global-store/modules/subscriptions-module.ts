import { Subscription } from "@/entities";

export function createSubscriptionsState() {
  return {
    subscriptions: [] as Subscription[]
  };
}

type State = ReturnType<typeof createSubscriptionsState>;

export function createSubscriptionsActions(set: (state: Partial<State>) => void) {
  return {
    updateSubscriptions: (subs: Subscription[]) =>
      set({
        subscriptions: [...subs]
      })
  };
}
