import express from 'express';

import React from 'react';
import {Provider} from 'react-redux';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import serialize from 'serialize-javascript';
import cookieParser from 'cookie-parser';

import themes from '../common/constants/themes.json';
import defaults from '../common/constants/defaults.json';
import filters from '../common/constants/filters.json';

import App from '../common/app';

import configureStore from '../common/store/configure';

import {State as GlobalState} from '../common/store/global/types';
import {initialState as globalInitialState} from '../common/store/global/index';
import {initialState as trendingTagsInitialState} from '../common/store/trending-tags/index';
import {initialState as communitiesInitialState} from '../common/store/communities/index';

import filterTagExtract from '../common/helper/filter-tag-extract';

import * as hiveApi from '../common/api/hive';

let assets: any;

const syncLoadAssets = () => {
    assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();

const server = express();

const makeGlobalState = (req: express.Request): GlobalState => {
    const theme = req.cookies['theme'] && themes.includes(req.cookies['theme']) ? req.cookies['theme'] : defaults.theme;
    const intro = !req.cookies['hide-intro'];
    let filter = '';
    let tag = '';

    const params = filterTagExtract(req.url);
    if (params) {
        const {filter: _filter, tag: _tag} = params;
        if (filters.includes(_filter)) {
            filter = _filter;
            tag = _tag;
        }
    }

    return {
        ...globalInitialState,
        theme,
        intro,
        filter,
        tag
    }
};

server
    .disable('x-powered-by')
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
    .use(cookieParser())
    .get('/*', async (req: express.Request, res: express.Response) => {

        const tags = await hiveApi.getTrendingTags();
        // const communities = await hiveApi.getCommunities();


        const preLoadedState = {
            counter: {val: 1},
            global: makeGlobalState(req),
            trendingTags: {...trendingTagsInitialState, list: tags},
            communities: communitiesInitialState
        };

        const store = configureStore(preLoadedState);

        const context = {};

        const markup = renderToString(
            <Provider store={store}>
                <StaticRouter location={req.url} context={context}>
                    <App/>
                </StaticRouter>
            </Provider>
        );

        const finalState = store.getState();

        const helmet = Helmet.renderStatic();
        const headHelmet = helmet.meta.toString() + helmet.title.toString() + helmet.link.toString();

        res.send(`<!doctype html>
            <html lang="">
            <head>
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta charSet='utf-8' />
                ${headHelmet}
                <meta name="viewport" content="width=device-width, initial-scale=1">
                ${assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''}
                  ${process.env.NODE_ENV === 'production'
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`}
            </head>
            <body class="theme-day">
                <div id="root">${markup}</div>
                <script>
                  window.__PRELOADED_STATE__ = ${serialize(finalState)}
                </script>
            </body>
        </html>`);
    });

export default server;
