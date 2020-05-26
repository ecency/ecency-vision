import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router';
import {createBrowserHistory, History} from 'history';

import global from './global';
import trendingTags from './trending-tags';
import communities from './communities';
import entries from './entries';

let reducers = {
    global,
    trendingTags,
    communities,
    entries
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
