import express from 'express';
import React from 'react';
import {Provider} from 'react-redux';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import serialize from 'serialize-javascript';

import App from '../common/app';

import configureStore from '../common/store/configure';

let assets: any;

const syncLoadAssets = () => {
    assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();

const fetchCounter = (): Promise<number> => {
    return new Promise(((resolve) => {
        resolve(18);
    }))
};

const server = express();

server
    .disable('x-powered-by')
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
    .get('/*', (req: express.Request, res: express.Response) => {

        fetchCounter().then(counter => {
            // Compile an initial state
            const preLoadedState = {counter: {val: 1}};

            // Create a new Redux store instance
            const store = configureStore(preLoadedState);

            const context = {};

            // Render the component to a string
            const markup = renderToString(
                <Provider store={store}>
                    <StaticRouter location={req.url} context={context}>
                        <App/>
                    </StaticRouter>
                </Provider>
            );

            // Grab the initial state from our Redux store
            const finalState = store.getState();

            res.send(`<!doctype html>
            <html lang="">
            <head>
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta charSet='utf-8' />
                <title>Razzle Redux Example</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                ${assets.client.css
                ? `<link rel="stylesheet" href="${assets.client.css}">`
                : ''}
                  ${process.env.NODE_ENV === 'production'
                ? `<script src="${assets.client.js}" defer></script>`
                : `<script src="${assets.client.js}" defer crossorigin></script>`}
            </head>
            <body>
                <div id="root">${markup}</div>
                <script>
                  window.__PRELOADED_STATE__ = ${serialize(finalState)}
                </script>
            </body>
        </html>`);
        });


    });

export default server;
