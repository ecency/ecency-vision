import {Entry} from '../store/entries/types';

import parseAsset from './parse-asset';
import isEmptyDate from './is-empty-date';

export default (entry: Entry) => {
    if (entry.pending_payout_value && isEmptyDate(entry.last_payout)) {
        return entry.total_payout_value ? parseAsset(entry.total_payout_value).value + parseAsset(entry.pending_payout_value).value : 0;
    }

    return entry.total_payout_value ? parseAsset(entry.total_payout_value).value + parseAsset(entry.curator_payout_value).value : 0;
};
