import {combineReducers} from 'redux';
import global from './global';
import trendingTags from './trending-tags';
import communities from './communities';
import entries from './entries';

const rootReducer = combineReducers({
    global,
    trendingTags,
    communities,
    entries
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
