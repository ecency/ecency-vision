import { PrivateKey } from '@hiveio/dhive';
import { powerLarynxByHs, powerLarynxByKc, powerLarynxByKey } from '../../../../api/spk-api';

export const powerByKey = (mode: 'up' | 'down', key: PrivateKey, asset: string, username: string, amount: string) => {
  switch (asset) {
    case 'LP':
    case 'LARYNX':
      return powerLarynxByKey(mode, username, key, amount);
    default:
      throw new Error('Power modal not configured.');
  }
}

export const powerByKc = (mode: 'up' | 'down', asset: string, username: string, amount: string) => {
  switch (asset) {
    case 'LP':
    case 'LARYNX':
      return powerLarynxByKc(mode, username, amount);
    default:
      throw new Error('Power modal not configured.');
  }
}

export const powerByHs = (mode: 'up' | 'down', asset: string, from: string, amount: string) => {
  switch (asset) {
    case 'LP':
    case 'LARYNX':
      powerLarynxByHs(mode, from, amount);
      break;
    default:
      throw new Error('Power modal not configured.');
  }
}