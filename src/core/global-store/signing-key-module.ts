export function createSigningKeyState() {
  return {
    signingKey: null as string | null
  };
}

type State = ReturnType<typeof createSigningKeyState>;

export function createSigningKeyActions(
  set: (state: Partial<State>) => void,
  getState: () => State
) {
  return {
    setSigningKey: (signingKey: string | null) => set({ signingKey })
  };
}
