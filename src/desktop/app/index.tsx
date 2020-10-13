import React from 'react';
import {render} from 'react-dom';

import {Provider} from "react-redux";
import {ConnectedRouter} from "connected-react-router";

import {AppState, history} from "../../common/store";
import {ListStyle, Theme} from "../../common/store/global/types";
import {Global} from "../../common/store/global/types";
import {activeUserMaker, clientStoreTasks} from "../../common/store/helper";
import configureStore from "../../common/store/configure";
import initialState from "../../common/store/initial-state";

import App from "../../common/app";

import defaults from "../../common/constants/defaults.json";

import * as ls from "../../common/util/local-storage";

import "typeface-ibm-plex-sans";

import "../../style/theme-day.scss";
import "../../style/theme-night.scss";

import "../../client/window";

import "./context-menu";

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
    activeUser: activeUser ? activeUserMaker(activeUser) : initialState.activeUser,
}

const store = configureStore(preloadedState);

document.addEventListener('DOMContentLoaded', () => {
    render(
        <Provider store={store}>
            <ConnectedRouter history={history!}>
                <App/>
            </ConnectedRouter>
        </Provider>,
        document.getElementById('root')
    );
});

clientStoreTasks(store);
