import React from "react";
import {hydrate} from "react-dom";
import {Provider} from "react-redux";
import {ConnectedRouter} from "connected-react-router";

import configureStore from "../common/store/configure";

import {hasKeyChainAct} from "../common/store/global";
import {clientStoreTasks} from "../common/store/helper";

import {history} from "../common/store";

import App from "../common/app";

import {AppWindow} from "./window";

import "../style/theme-day.scss";
import "../style/theme-night.scss";
import "../style/theme-dusk.scss";
import "../style/theme-burning.scss";
import "../style/theme-sky.scss";

import './base-handlers';
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../core/react-query";

declare var window: AppWindow;

const store = configureStore(window["__PRELOADED_STATE__" as any] as any);

hydrate(
    <QueryClientProvider client={queryClient}>
      {/*@ts-ignore*/}
        <Hydrate state={window.__REACT_QUERY_STATE__}>
            <Provider store={store}>
                <ConnectedRouter history={history!}>
                    <App/>
                </ConnectedRouter>
            </Provider>
        </Hydrate>
    </QueryClientProvider>
    ,
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

if (module.hot) {
    module.hot.accept("../common/app", () => {
        hydrate(
            <QueryClientProvider client={queryClient}>
                {/*@ts-ignore*/}
                <Hydrate state={window.__REACT_QUERY_STATE__}>
                    <Provider store={store}>
                        <ConnectedRouter history={history!}>
                            <App/>
                        </ConnectedRouter>
                    </Provider>
                </Hydrate>
            </QueryClientProvider>,
            document.getElementById("root")
        );
    });
}

