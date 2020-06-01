import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import {createBrowserHistory, History} from 'history';

import global from './global';
import trendingTags from './trending-tags';
import community from './community';
import entries from './entries';
import profiles from './profiles';

let reducers = {
    global,
    trendingTags,
    community,
    entries,
    profiles
};

export let history: History | undefined;

// create browser history on client side
if (typeof window !== 'undefined') {
    history = createBrowserHistory();

    // @ts-ignore
    reducers = {router: connectRouter(history), ...reducers};
}

const rootReducer = combineReducers(reducers);

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
