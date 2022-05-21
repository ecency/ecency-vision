import { createClient } from 'redis';
import { renderAmpBody } from '@ecency/render-helper-amp';
import { render } from '../template';
import { Request } from 'express';
import { AppState } from '../../common/store';

export async function getAsAMP(identifier: string, request: Request, preloadedState: AppState): Promise<string> {
  const client = createClient();
  await client.connect();

  const cache = await client.get(identifier);
  if (cache) {
    return cache;
  }

  const renderResult = render(request, preloadedState);
  const ampResult = await renderAmpBody(renderResult, false, false, false);

  await client.set(identifier, ampResult);
  return ampResult;
}