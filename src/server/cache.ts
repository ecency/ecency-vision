import NodeCache from 'node-cache';

export const cache = new NodeCache({stdTTL: 0, checkperiod: 600});
