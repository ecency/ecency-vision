import React from 'react';
import {hydrate} from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';

import configureStore from '../common/store/configure';

import App from '../common/app';

import 'typeface-ibm-plex-sans';

import '../style/theme-day.scss';
import '../style/theme-night.scss';

const store = configureStore(window['__PRELOADED_STATE__']);

hydrate(
    (
        <Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider>
    ),
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('../common/app', () => {
        hydrate(
            (
                <Provider store={store}>
                    <BrowserRouter>
                        <App/>
                    </BrowserRouter>
                </Provider>
            ),
            document.getElementById('root')
        );
    });
}
