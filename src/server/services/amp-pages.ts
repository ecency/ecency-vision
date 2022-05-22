import { Request } from 'express';
import { createClient } from 'redis';
import { renderAmpBody } from '@ecency/render-helper-amp';
import { render } from '../template';
import { AppState } from '../../common/store';

export async function getAsAMP(
  identifier: string,
  request: Request,
  preloadedState: AppState,
  forceRender = false,
): Promise<string> {
  const client = createClient();
  await client.connect();

  const cache = await client.get(identifier);
  if (cache && !forceRender) {
    return cache;
  }

  const renderResult = render(request, preloadedState);
  // const ampResult = await renderAmpBody(renderResult, false, false, false);

  await client.set(identifier, renderResult);
  return renderResult;
}