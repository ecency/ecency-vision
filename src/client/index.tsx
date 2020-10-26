import React from "react";
import {hydrate} from "react-dom";
import {Provider} from "react-redux";
import {ConnectedRouter} from "connected-react-router";

import configureStore from "../common/store/configure";

import {hasKeyChainAct} from "../common/store/global";
import {clientStoreTasks} from "../common/store/helper";

import {history} from "../common/store";

import App from "../common/app";

import "typeface-ibm-plex-sans";

import "../style/theme-day.scss";
import "../style/theme-night.scss";

import './window';

const store = configureStore(window["__PRELOADED_STATE__"]);

hydrate(
    <Provider store={store}>
        <ConnectedRouter history={history!}>
            <App/>
        </ConnectedRouter>
    </Provider>,
    document.getElementById("root")
);

clientStoreTasks(store);

// Check & activate keychain support
window.addEventListener("load", () => {
    if (window["hive_keychain"]) {
        store.dispatch(hasKeyChainAct());
    }
});

if (module.hot) {
    module.hot.accept("../common/app", () => {
        hydrate(
            <Provider store={store}>
                <ConnectedRouter history={history!}>
                    <App/>
                </ConnectedRouter>
            </Provider>,
            document.getElementById("root")
        );
    });
}
