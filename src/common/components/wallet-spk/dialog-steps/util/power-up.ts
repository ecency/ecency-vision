import { PrivateKey } from '@hiveio/dhive';
import { powerUpLarynxByHs, powerUpLarynxByKc, powerUpLarynxByKey } from '../../../../api/spk-api';

export const powerUpByKey = (key: PrivateKey, asset: string, username: string, amount: string) => {
  switch (asset) {
    case 'LARYNX':
      return powerUpLarynxByKey(username, key, amount);
    default:
      throw new Error('Claiming modal not configured.');
  }
}

export const powerUpByKc = (asset: string, username: string, amount: string) => {
  switch (asset) {
    case 'LARYNX':
      return powerUpLarynxByKc(username, amount);
    default:
      throw new Error('Delegation modal not configured.');
  }
}

export const powerUpByHs = (asset: string, from: string, amount: string) => {
  switch (asset) {
    case 'LARYNX':
      powerUpLarynxByHs(from, amount);
      break;
    default:
      throw new Error('Delegation modal not configured.');
  }
}