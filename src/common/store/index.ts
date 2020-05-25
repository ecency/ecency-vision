import {combineReducers} from 'redux';
import counter from './counter';
import global from './global';
import trendingTags from './trending-tags';

const rootReducer = combineReducers({
    counter,
    global,
    trendingTags
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
