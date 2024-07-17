export function createNotificationsState() {
  return {
    fbSupport: "pending" as "pending" | "granted" | "denied"
  };
}

type State = ReturnType<typeof createNotificationsState>;

export function createNotificationsActions(
  set: (state: Partial<State>) => void,
  getState: () => State
) {
  return {
    setFbSupport: (v: "pending" | "granted" | "denied") => set({ fbSupport: v })
  };
}
