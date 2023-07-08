import React from "react";
import { render } from "react-dom";

import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";

// why "require" instead "import" ? see: https://github.com/ReactTraining/react-router/issues/6203
const pathToRegexp = require("path-to-regexp");

import { AppState, history } from "../../common/store";
import { ListStyle, Theme } from "../../common/store/global/types";
import { Global } from "../../common/store/global/types";
import { newVersionChangeAct } from "../../common/store/global";

import { activeUserMaker, clientStoreTasks } from "../../common/store/helper";

import configureStore from "../../common/store/configure";
import initialState from "../../common/store/initial-state";

import App from "../../common/app";

import defaults from "../../common/constants/defaults.json";

import * as ls from "../../common/util/local-storage";

import routes from "../../common/routes";

import { DesktopWindow } from "./window";

import "../../style/style.scss";

import "../../client/base-handlers";

import "./context-menu";
import log from "electron-log";
import path from "path";

declare var window: DesktopWindow;

// Add electron dependencies into window.
window.ipcRenderer = require("electron").ipcRenderer;
window.remote = require("electron").remote;

// Create store
const theme = ls.get("theme") || defaults.theme;
const intro = !ls.get("hide-intro");
const listStyle = ls.get("list-style") || defaults.listStyle;

const globalState: Global = {
  ...initialState.global,
  theme: Theme[theme],
  listStyle: ListStyle[listStyle],
  intro,
  isElectron: true
};

const activeUser = ls.get("active_user");

const preloadedState: AppState = {
  ...initialState,
  global: globalState,
  activeUser: activeUser ? activeUserMaker(activeUser) : initialState.activeUser
};

const store = configureStore(preloadedState);

document.addEventListener("DOMContentLoaded", () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history!}>
        <App />
      </ConnectedRouter>
    </Provider>,
    document.getElementById("root")
  );

  // To prevent blinking on initial window load
  document.body.style.visibility = "hidden";
  setTimeout(() => {
    document.body.style.visibility = "visible";
  }, 300);
});

// Initial or repeating storage tasks.
clientStoreTasks(store);

// Deep link handler
window.addEventListener("deep-link", (e) => {
  const urlToPath = (url: string): string => {
    let path = url.split("://")[1];
    // add "/" to beginning
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    // remove last char if "/"
    if (path.endsWith("/")) {
      path = path.substring(0, path.length - 1);
    }

    return path;
  };

  const event = e as CustomEvent;
  const { url } = event.detail;
  const path = urlToPath(url);

  // check if the link received matches with a route
  const pathMatch = Object.values(routes).find((p) => {
    return pathToRegexp(p).test(path);
  });

  if (pathMatch) {
    history!.push(path);
  }
});

// Auto updater.
window["ipcRenderer"].on("update-available", (event: any, version: string) => {
  store.dispatch(newVersionChangeAct(version));
});

log.transports.file.resolvePath = () => path.join(__dirname, "logs/main.log");
