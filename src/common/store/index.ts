import {combineReducers} from 'redux';
import counter from './counter';
import global from './global';

const rootReducer = combineReducers({
    counter,
    global
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
