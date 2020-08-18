import React from "react";
import {hydrate} from "react-dom";
import {Provider} from "react-redux";
import {ConnectedRouter} from "connected-react-router";

import configureStore from "../common/store/configure";
import {reloadAct as reloadUsers} from "../common/store/users";
import {loginAct as loginActiveUser, updateAct as updateActiveUserAct} from "../common/store/active-user";
import {reloadAct as reloadReblogs} from "../common/store/reblogs";
import {fetchedAct as loadDynamicProps} from "../common/store/dynamic-props";

import {getAccount, getDynamicProps} from "../common/api/hive";
import {usrActivity, getPoints} from "../common/api/private";

import {history} from "../common/store";

import App from "../common/app";

import "typeface-ibm-plex-sans";

import "../style/theme-day.scss";
import "../style/theme-night.scss";

import './window';


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
            <App/>
        </ConnectedRouter>
    </Provider>,
    document.getElementById("root")
);

// Initial state from browser's local storage
store.dispatch(reloadUsers());
store.dispatch(loginActiveUser());
store.dispatch(reloadReblogs());

// Load dynamic props
getDynamicProps().then((resp) => {
    store.dispatch(loadDynamicProps(resp));
});

// Active user updater
const updateActiveUser = async () => {
    const state = store.getState();
    if (state.activeUser) {
        const {username} = state.activeUser;

        let account;
        let p;
        try {
            account = await getAccount(username);
            p = await getPoints(username);
        } catch (e) {
            return;
        }

        const points = {points: p.points, uPoints: p.unclaimed_points};
        store.dispatch(updateActiveUserAct(account, points));
    }
};
updateActiveUser().then();
setInterval(updateActiveUser, 60 * 1000);

const checkIn = () => {
    const state = store.getState();
    if (state.activeUser) {
        usrActivity(state.activeUser?.username!, 10).then();
    }
}
checkIn();
setInterval(checkIn, 1000 * 60 * 15 + 8);

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
