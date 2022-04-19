import { OperationGroup, Transaction } from './types';
import { utils } from '@hiveio/dhive';
import { getAccountHistory } from '../../api/hive';
import { ACCOUNT_OPERATION_GROUPS } from './index';

const ALL_ACCOUNT_OPERATIONS = [...Object.values(ACCOUNT_OPERATION_GROUPS)].reduce((acc, val) => acc.concat(val), []);

export const fetchTransactions = async (username: string, group: OperationGroup | "" = "", start = -1, limit = 20) => {
  const name = username.replace("@", "");

  let filters: any[];
  switch (group) {
    case "transfers":
      filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS['transfers']);
      break;
    case "market-orders":
      filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS['market-orders']);
      break;
    case "interests":
      filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS['interests']);
      break;
    case "stake-operations":
      filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS['stake-operations']);
      break;
    case "rewards":
      filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS['rewards']);
      break;
    default:
      filters = utils.makeBitMaskFilter(ALL_ACCOUNT_OPERATIONS); // all
  }

  try {
    const r = await getAccountHistory(name, filters, start, limit);

    const mapped: Transaction[] = r.map((x: any) => ({
      num: x[0],
      type: x[1].op[0],
      timestamp: x[1].timestamp,
      trx_id: x[1].trx_id,
      ...x[1].op[1],
    }));

    return mapped
      .filter(x => x !== null)
      .sort((a: any, b: any) => b.num - a.num);
  } catch (e) {
    return [];
  }
};