import { Request } from 'express';
import { createClient } from 'redis';
import { AppState } from '../../common/store';
import { renderAmp } from '../amp-template';
import { renderAmpBody } from '@ecency/render-helper-amp';
import * as fs from 'fs';

let assets: any = require(process.env.RAZZLE_ASSETS_MANIFEST || '');

export async function getAsAMP(
  identifier: string,
  request: Request,
  preloadedState: AppState,
  forceRender = false,
): Promise<string> {
  const client = createClient();

  const cache = client.get(identifier);
  // if (cache && !forceRender) {
  //   return cache;
  // }

  const renderResult = await renderAmp(request, preloadedState);

  let ampResult = await renderAmpBody(renderResult, false, false, false);
  ampResult = ampResult.replace(/\n/gm, '');

  const ampStyleMatch = ampResult.match(/<style.*<\/style>/gm);
  let ampStyle = ampStyleMatch ? ampStyleMatch[0] : '';

  if (ampStyle) {
    const pageStyles = fs.readFileSync(`build/public${assets['pages-amp-entry-amp-page'].css[0]}`).toString();
    ampStyle = ampStyle
      .replace(/\n/gm, '')
      .replace(/<style.*>/, '')
      .replace(/<\/style>/, '')

    ampStyle += pageStyles;
    ampResult = ampResult.replace(/<style.*<\/style>/gm, `<style>${ampStyle}</style>`);
  }

  client.set(identifier, renderResult);
  return ampResult;
}