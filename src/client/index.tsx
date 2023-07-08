import React from "react";
import { hydrate } from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import configureStore from "../common/store/configure";
import { hasKeyChainAct } from "../common/store/global";
import { clientStoreTasks } from "../common/store/helper";
import { history } from "../common/store";
import App from "../common/app";
import { AppWindow } from "./window";
import "../style/style.scss";
import "./base-handlers";
import { loadableReady } from "@loadable/component";
import { queryClient } from "../common/core";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";

declare var window: AppWindow;

const store = configureStore(window["__PRELOADED_STATE__"]);

if (process.env.NODE_ENV === "production") {
  console.log(`@@@@@@@(((((@@@@@@@@@@@@@
@@@(((((((((((((@@@@@@@@@
@((((@@@@@@@@@((((@@@@@@@
@(((@@@(((((@@@((((%@@@@@
((((@@@(((@@@@#((((((((%@
((((@@@((((((((((@@@@((((
((((@@@@@@&&&@@@@@@@@@(((
((((@@@@@@@@@@@@@@@@@((((
(((((%@@@@@@@@@%%(((((((@
@@(((((((((((((((((((@@@@`);
  console.log("%c%s", "font-size: 16px;", "We are hiring!");
  console.log(
    "%c%s",
    "font-size: 12px;",
    "Are you developer, looking ways to contribute? \nhttps://github.com/ecency/ecency-vision \n\n"
  );
}

loadableReady().then(() => {
  hydrate(
    <QueryClientProvider client={queryClient}>
      {/*@ts-ignore*/}
      <Hydrate state={window.__REACT_QUERY_STATE__}>
        <Provider store={store}>
          <ConnectedRouter history={history!}>
            <App />
          </ConnectedRouter>
        </Provider>
      </Hydrate>
    </QueryClientProvider>,
    document.getElementById("root")
  );

  clientStoreTasks(store);

  // Check & activate keychain support
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (window.hive_keychain) {
        window.hive_keychain.requestHandshake(() => {
          store.dispatch(hasKeyChainAct());
        });
      }
    }, 50);
  });
});

if (module.hot) {
  module.hot.accept("../common/app", () => {
    hydrate(
      <QueryClientProvider client={queryClient}>
        {/*@ts-ignore*/}
        <Hydrate state={window.__REACT_QUERY_STATE__}>
          <Provider store={store}>
            <ConnectedRouter history={history!}>
              <App />
            </ConnectedRouter>
          </Provider>
        </Hydrate>
      </QueryClientProvider>,
      document.getElementById("root")
    );
  });
}
