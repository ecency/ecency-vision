import React from "react";
import { hydrate } from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

import configureStore from "../common/store/configure";
import { reloadAct as reloadUsers } from "../common/store/users";
import { reloadAct as reloadActiveUser, updateAct } from "../common/store/active-user";

import { getAccount } from "../common/api/hive";

import { history } from "../common/store/index";

import App from "../common/app";

import "typeface-ibm-plex-sans";

import "../style/theme-day.scss";
import "../style/theme-night.scss";

const store = configureStore(window["__PRELOADED_STATE__"]);

history!.listen((location, action) => {
  if (action === "PUSH") {
    // Scroll to top on every push action
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  }
});

hydrate(
  <Provider store={store}>
    <ConnectedRouter history={history!}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);

// Since user data stored on local storage, state should be reloaded on first load.
store.dispatch(reloadUsers());
store.dispatch(reloadActiveUser());

// Active user updater
const updateActiveUser = () => {
  const state = store.getState();
  if (state.activeUser) {
    getAccount(state.activeUser.username).then((r) => {
      store.dispatch(updateAct(r));
    });
  }
};
updateActiveUser();
setInterval(updateActiveUser, 60 * 60 * 1000);

if (module.hot) {
  module.hot.accept("../common/app", () => {
    hydrate(
      <Provider store={store}>
        <ConnectedRouter history={history!}>
          <App />
        </ConnectedRouter>
      </Provider>,
      document.getElementById("root")
    );
  });
}
