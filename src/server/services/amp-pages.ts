import { Request } from 'express';
import { createClient } from 'redis';
import { AppState } from '../../common/store';
import { renderAmp } from '../amp-template';
// @ts-ignore
import amp from '@ampproject/toolbox-optimizer';
import { cleanReply } from '@ecency/render-helper-amp/lib/methods';

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
  const optimizer = amp.create({
    verbose: true,
    canonical: '.',
    markdown: true
  });

  const ampResult = await optimizer.transformHtml(cleanReply(renderResult));

  client.set(identifier, renderResult);
  return ampResult;
}