import React from 'react';
import {render} from 'react-dom';

import {Provider} from "react-redux";
import {ConnectedRouter} from "connected-react-router";

import configureStore from "../../common/store/configure";

import {history} from "../../common/store";

import App from "../../common/app";

import "typeface-ibm-plex-sans";

import "../../style/theme-day.scss";
import "../../style/theme-night.scss";

const store = configureStore(null);

console.log(store.getState())

document.addEventListener('DOMContentLoaded', () => {
    render(
        <Provider store={store}>
            <ConnectedRouter history={history!}>
                <App/>
            </ConnectedRouter>
        </Provider>,
        document.getElementById('root')
    );
});
