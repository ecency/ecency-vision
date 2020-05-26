import express from 'express';

import React from 'react';

import cookieParser from 'cookie-parser';

import filters from '../common/constants/filters.json';

import entryIndexHandler from './handlers/entry-index';

const server = express();

server
    .disable('x-powered-by')
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
    .use(cookieParser())
    .use([
            '^/$',  // index
            `^/:filter(${filters.join('|')})$`, // /trending
            `^/:filter(${filters.join('|')})/:tag$` //  /trending/esteem
        ], entryIndexHandler
    );

export default server;
