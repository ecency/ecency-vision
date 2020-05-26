import express from 'express';

import React from 'react';
import {Provider} from 'react-redux';
import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';

import configureStore from '../../common/store/configure';

import {initialState as globalInitialState} from '../../common/store/global/index';
import {initialState as trendingTagsInitialState} from '../../common/store/trending-tags/index';
import {initialState as communitiesInitialState} from '../../common/store/communities/index';

import {makeGroupKey} from '../../common/store/entries/index';

import {readGlobalCookies} from '../helper';

import App from '../../common/app';

import * as hiveApi from '../../common/api/hive';

import filterTagExtract from '../../common/helper/filter-tag-extract';

import {render} from '../template';

export default async (req: express.Request, res: express.Response) => {
    const params = filterTagExtract(req.originalUrl)!;
    const {filter, tag} = params;

    const entries = await hiveApi.getPostsRanked(filter, tag);
    const tags = await hiveApi.getTrendingTags();
    const communities = await hiveApi.getCommunities();
    const communityList = {};

    if (communities) {
        communities.forEach(x => {
            communityList[x.name] = x;
        })
    }

    const preLoadedState = {
        global: {...globalInitialState, ...readGlobalCookies(req), ...{filter, tag}},
        trendingTags: {...trendingTagsInitialState, list: tags},
        communities: {...communitiesInitialState, list: communityList},
        entries: {
            [`${makeGroupKey(filter, tag)}`]: {
                entries: entries,
                error: null,
                loading: false,
                hasMore: true
            }
        }
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

    res.send(render(markup, finalState));
}
