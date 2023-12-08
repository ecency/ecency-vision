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
    toggleUiProp: (type: "login" | "loginKc" | "notifications") => {
      if (type === "login") {
        set({
          login: !getState().login
        });
      } else if (type === "loginKc") {
        set({
          loginKc: !getState().loginKc
        });
      } else if (type === "notifications") {
        set({
          uiNotifications: !getState().uiNotifications
        });
      }
    }
  };
}
