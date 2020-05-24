import React from 'react';
import {hydrate} from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import configureStore from '../common/store/configure';
import Root from '../common/root';


const store = configureStore(window['__PRELOADED_STATE__']);

hydrate(
    (
        <Provider store={store}>
            <BrowserRouter>
                <Root/>
            </BrowserRouter>
        </Provider>
    ),
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('../common/containers/App', () => {
        hydrate(
            (
                <Provider store={store}>
                    <BrowserRouter>
                        <Root/>
                    </BrowserRouter>
                </Provider>
            ),
            document.getElementById('root')
        );
    });
}
