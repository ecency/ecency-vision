import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './root';

const configureStore = (preloadedState: any) => {
    const store = createStore(
        rootReducer,
        preloadedState,
        applyMiddleware(thunk)
    );

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./root', () => {
            const nextRootReducer = require('./root').default;
            store.replaceReducer(nextRootReducer);
        });
    }

    return store;
};

export default configureStore;
