export function createUiState() {
  return {
    login: false,
    loginKc: false,
    uiNotifications: false
  };
}

type State = ReturnType<typeof createUiState>;

export function createUiActions(set: (state: Partial<State>) => void, getState: () => State) {
  return {
    toggleUiProp: (type: "login" | "loginKc" | "notifications", value?: boolean) => {
      if (type === "login") {
        set({
          login: value ?? !getState().login
        });
      } else if (type === "loginKc") {
        set({
          loginKc: value ?? !getState().loginKc
        });
      } else if (type === "notifications") {
        set({
          uiNotifications: value ?? !getState().uiNotifications
        });
      }
    }
  };
}
