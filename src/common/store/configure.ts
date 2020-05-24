import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './index';

const configureStore = (preloadedState: any) => {
    const store = createStore(
        rootReducer,
        preloadedState,
        applyMiddleware(thunk)
    );

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./index', () => {
            const nextRootReducer = require('./index').default;
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
};

export default configureStore;
