import {combineReducers} from 'redux';
import global from './global';
import trendingTags from './trending-tags';
import communities from './communities';

const rootReducer = combineReducers({
    global,
    trendingTags,
    communities
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
