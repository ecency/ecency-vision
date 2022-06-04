import { Request } from 'express';
import { createClient, RedisClient } from 'redis';
import { AppState } from '../../common/store';
import { renderAmp } from '../amp-template';
// @ts-ignore
import amp from '@ampproject/toolbox-optimizer';
import { renderAmpBody } from '@ecency/render-helper-amp';
import * as fs from 'fs';
import { promisify } from 'util';

let assets: any = require(process.env.RAZZLE_ASSETS_MANIFEST || '');
const redisGetAsync = (client: RedisClient) => promisify(client.get).bind(client);
const redisSetAsync = (client: RedisClient) => promisify(client.set).bind(client);

export async function getAsAMP(
  identifier: string,
  request: Request,
  preloadedState: AppState,
  forceRender = false,
): Promise<string> {
  const client = createClient();

  const cache = await redisGetAsync(client)(identifier);
  if (cache && !forceRender) {
    return cache;
  }

  const renderResult = await renderAmp(request, preloadedState);

  let ampResult = await renderAmpBody(renderResult, false, false, false);
  ampResult = ampResult.replace(/\n/gm, '');

  const styleBlockIndex = ampResult.search('</style>') + 8;
  const pageStyles = fs.readFileSync(`build/public${assets['pages-amp-entry-amp-page'].css[0]}`).toString();

  ampResult = [ampResult.slice(0, styleBlockIndex), `<style amp-custom>${pageStyles}</style>`, ampResult.slice(styleBlockIndex)].join('');

  const modifiedClasses = 'theme-day';
  ampResult = ampResult.replace('<body>', `<body class="${modifiedClasses}">`);

  await redisSetAsync(client)(identifier, ampResult);
  return ampResult;
}