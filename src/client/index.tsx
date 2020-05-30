import React from 'react';
import {hydrate} from 'react-dom';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'connected-react-router';

import configureStore from '../common/store/configure';
import {history} from '../common/store/index';

import App from '../common/app';

import 'typeface-ibm-plex-sans';

import '../style/theme-day.scss';
import '../style/theme-night.scss';

const store = configureStore(window['__PRELOADED_STATE__']);

// Scroll page to top on every location change if there is no hash in new location.
history!.listen((location, action) => {
    if (location.hash === '') {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

hydrate(
    (
        <Provider store={store}>
            <ConnectedRouter history={history!}>
                <App/>
            </ConnectedRouter>
        </Provider>
    ),
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('../common/app', () => {
        hydrate(
            (
                <Provider store={store}>
                    <ConnectedRouter history={history!}>
                        <App/>
                    </ConnectedRouter>
                </Provider>
            ),
            document.getElementById('root')
        );
    });
}
