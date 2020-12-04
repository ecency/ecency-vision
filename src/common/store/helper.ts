import {Store} from "redux";

const getSymbolFromCurrency = require("currency-symbol-map");

import {AppState} from "./index";
import {ActiveUser, UserPoints} from "./active-user/types";
import {loginAct as loginActiveUser, updateAct as updateActiveUserAct} from "./active-user";

import {getAccount, getDynamicProps} from "../api/hive";
import {getPoints, usrActivity, getPromotedEntries} from "../api/private";
import {reloadAct as reloadUsers} from "./users";
import {reloadAct as reloadReblogs} from "./reblogs";
import {fetchedAct as loadDynamicProps} from "./dynamic-props";
import {fetchedAct as entriesFetchedAct} from "../../common/store/entries";
import {setCurrencyAct as setCurrency, muteNotificationsAct as muteNotifications} from "./global";

import {getCurrencyRate} from "../api/misc";

import currencies from "../constants/currencies.json";

import * as ls from "../../common/util/local-storage";

export const activeUserMaker = (name: string, points: string = "0.000", uPoints: string = "0.000"): ActiveUser => {
    return {
        username: name,
        data: {name},
        points: {
            points,
            uPoints
        }
    }
}

export const activeUserUpdater = async (store: Store<AppState>) => {
    const state = store.getState();
    if (state.activeUser) {
        const {username} = state.activeUser;

        let account;
        try {
            account = await getAccount(username);
        } catch (e) {
            return;
        }

        let points: UserPoints;
        try {
            const p = await getPoints(username);
            points = {points: p.points, uPoints: p.unclaimed_points};
        } catch (e) {
            points = {
                points: "0.000",
                uPoints: "0.000"
            };
        }

        store.dispatch(updateActiveUserAct(account, points));
    }
};

export const clientStoreTasks = (store: Store<AppState>) => {
    // Initial state from browser's local storage
    store.dispatch(reloadUsers());
    store.dispatch(loginActiveUser());
    store.dispatch(reloadReblogs());

    // Load dynamic props
    getDynamicProps().then((resp) => {
        store.dispatch(loadDynamicProps(resp));
    });

    // Update active user in interval
    activeUserUpdater(store).then();
    setInterval(() => {
        activeUserUpdater(store).then();
    }, 60 * 1000);

    // Do check-in in interval
    const checkIn = () => {
        const state = store.getState();
        if (state.activeUser) {
            usrActivity(state.activeUser?.username!, 10).then();
        }
    }
    checkIn();
    setInterval(checkIn, 1000 * 60 * 15 + 8);

    // Inject / update promoted entries to store
    const promotedEntries = () => {
        getPromotedEntries().then(r => {
            store.dispatch(entriesFetchedAct("__promoted__", r, false));
        })
    }
    promotedEntries();
    setInterval(promotedEntries, 1000 * 60 * 5);

    // Currency
    const currency = ls.get("currency");
    if (currency && currencies.find(x => x.id === currency)) {
        const symbol = getSymbolFromCurrency(currency);
        getCurrencyRate(currency).then(rate => {
            store.dispatch(setCurrency(currency, rate, symbol));
        });
    }

    // Notifications
    if (ls.get("notifications") === false) {
        store.dispatch(muteNotifications());
    }
}
