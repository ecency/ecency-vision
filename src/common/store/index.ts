import {combineReducers} from "redux";
import {connectRouter} from "connected-react-router";
import {createBrowserHistory, History} from "history";

import global from "./global";
import dynamicProps from "./dynamic-props";
import trendingTags from "./trending-tags";
import community from "./community";
import entries from "./entries";
import accounts from "./accounts";
import transactions from "./transactions";
import users from "./users";
import activeUser from "./active-user";
import reblogs from "./reblogs";
import discussion from "./discussion";

let reducers = {
    global,
    dynamicProps,
    trendingTags,
    community,
    entries,
    accounts,
    transactions,
    users,
    activeUser,
    reblogs,
    discussion
};

export let history: History | undefined;

// create browser history on client side
if (typeof window !== "undefined") {
    history = createBrowserHistory();

    // @ts-ignore
    reducers = {router: connectRouter(history), ...reducers};
}

const rootReducer = combineReducers(reducers);

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
