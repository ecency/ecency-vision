import {
  createStore,
  applyMiddleware,
  compose,
  Middleware,
  Store,
} from "redux";
import thunk from "redux-thunk";
import { routerMiddleware } from "connected-react-router";

import rootReducer, { AppState, history } from "./index";

const enhancers = [];
let middleware: Middleware[] = [thunk];

// history is active only client side
if (history) {
  middleware = [...middleware, routerMiddleware(history)];
}

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  const devToolsExtension = (window as any)["__REDUX_DEVTOOLS_EXTENSION__"];

  if (typeof devToolsExtension === "function") {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

const configureStore = (preLoadedState: AppState): Store<AppState> => {
  const store = createStore(rootReducer, preLoadedState, composedEnhancers);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept("./index", () => {
      const nextRootReducer = require("./index").default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
};

export default configureStore;
