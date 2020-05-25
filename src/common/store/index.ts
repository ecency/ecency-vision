import {combineReducers} from 'redux';
import counter from './counter';
import global from './global';
import trendingTags from './trending-tags';
import communities from './communities';

const rootReducer = combineReducers({
    counter,
    global,
    trendingTags,
    communities
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
