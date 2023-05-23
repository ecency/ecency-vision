import { Store } from "redux";

import i18n from "i18next";

import { AppState } from "./index";
import { ActiveUser, UserPoints } from "./active-user/types";
import {
  loginAct as loginActiveUser,
  logoutAct as logoutActiveUser,
  updateAct as updateActiveUserAct
} from "./active-user";

import { getAccount, getDynamicProps } from "../api/hive";
import { getPoints, usrActivity, getPromotedEntries } from "../api/private-api";
import { reloadAct as reloadUsers } from "./users";
import { fetchedAct as loadDynamicProps } from "./dynamic-props";
import { fetchedAct as entriesFetchedAct } from "./entries";
import {
  setCurrencyAct as setCurrency,
  muteNotificationsAct as muteNotifications,
  setLangAct as setLang,
  setNsfwAct as setNsfw
} from "./global";

import { getCurrencyRate } from "../api/misc";

import currencies from "../constants/currencies.json";

import * as ls from "../../common/util/local-storage";

import currencySymbol from "../../common/helper/currency-symbol";

import { AppWindow } from "../../client/window";

declare var window: AppWindow;

export const activeUserMaker = (
  name: string,
  points: string = "0.000",
  uPoints: string = "0.000"
): ActiveUser => {
  return {
    username: name,
    data: { name },
    points: {
      points,
      uPoints
    }
  };
};

export const activeUserUpdater = async (store: Store<AppState>) => {
  const state = store.getState();
  if (state.activeUser) {
    const { username } = state.activeUser;

    let account;
    try {
      account = await getAccount(username);
    } catch (e) {
      return;
    }

    let points: UserPoints;
    try {
      const p = await getPoints(username);
      points = { points: p.points, uPoints: p.unclaimed_points };
    } catch (e) {
      points = {
        points: "0.000",
        uPoints: "0.000"
      };
    }

    store.dispatch(updateActiveUserAct(account, points));
  }
};

export const syncActiveUser = (store: Store<AppState>) => {
  const state = store.getState();

  const activeUser = ls.get("active_user");

  // logout
  if (!activeUser && state.activeUser) {
    store.dispatch(logoutActiveUser());
    return;
  }

  // login
  if (activeUser && !state.activeUser) {
    store.dispatch(loginActiveUser());
    activeUserUpdater(store).then();
    return;
  }

  // switch
  if (activeUser && state.activeUser && activeUser !== state.activeUser.username) {
    store.dispatch(loginActiveUser());
    activeUserUpdater(store).then();
    return;
  }
};

export const clientStoreTasks = (store: Store<AppState>) => {
  // To use in places where we can't access to store
  window.usePrivate = store.getState().global.usePrivate;

  // Initial state from browser's local storage
  store.dispatch(reloadUsers());
  store.dispatch(loginActiveUser());

  // Load dynamic props
  getDynamicProps().then((resp) => {
    store.dispatch(loadDynamicProps(resp));
  });

  // Update active user in interval
  activeUserUpdater(store).then();
  setInterval(() => {
    activeUserUpdater(store).then();
  }, 60 * 1000);

  // Active user sync between tabs / windows
  setInterval(() => {
    syncActiveUser(store);
  }, 2000);

  // Do check-in in interval
  const checkIn = () => {
    const state = store.getState();
    if (state.activeUser) {
      usrActivity(state.activeUser?.username!, 10).then();
    }
  };

  // wait for initial user sync
  setTimeout(() => {
    checkIn();
  }, 5000);
  setInterval(checkIn, 1000 * 60 * 15 + 8);

  // Inject / update promoted entries to store
  const promotedEntries = () => {
    getPromotedEntries().then((r) => {
      store.dispatch(entriesFetchedAct("__promoted__", r, "", false));
    });
  };

  promotedEntries();
  setInterval(promotedEntries, 1000 * 60 * 5);

  // Currency
  const currency = ls.get("currency");
  if (currency && currencies.find((x) => x.id === currency)) {
    const symbol = currencySymbol(currency);
    getCurrencyRate(currency).then((rate) => {
      store.dispatch(setCurrency(currency, rate, symbol));
    });
  }

  // Notifications
  if (ls.get("notifications") === false) {
    store.dispatch(muteNotifications());
  }

  // Language
  const lang = ls.get("lang");
  if (lang) {
    if (store.getState().global.lang !== lang) {
      i18n.changeLanguage(lang).then(() => {
        store.dispatch(setLang(lang));
      });
    }
  }

  // NSFW
  if (ls.get("nsfw") === true) {
    store.dispatch(setNsfw(true));
  }
};
