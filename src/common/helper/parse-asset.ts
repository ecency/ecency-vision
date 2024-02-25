import { SMTAsset } from '@hiveio/dhive';

export enum NaiMap {
    '@@000000021' = 'HIVE',
    '@@000000013' = 'HBD',
    '@@000000037' = 'VESTS',
}

export enum Symbol {
    HIVE = 'HIVE',
    HBD = 'HBD',
    VESTS = 'VESTS',
}

type SymbolRecord = Record<string, Symbol>;

const SymbolMap: SymbolRecord | any = {
    'HIVE': Symbol.HIVE,
    'HBD': Symbol.HBD,
    'VESTS': Symbol.VESTS,
};

export interface Asset {
    amount: number;
    symbol: Symbol;
}

export default (sval: string | SMTAsset): Asset => {
    if (typeof sval === 'string') {
        const sp = sval.split(' ');
        const symbol = SymbolMap[sp[1]];
        return {
            amount: parseFloat(sp[0]),
            symbol: symbol || Symbol.HIVE,
        };
    } else {
        const symbol = SymbolMap[sval.nai];
        return {
            amount: parseFloat(sval.amount.toString()) / Math.pow(10, sval.precision),
            symbol: symbol || Symbol.HIVE,
        };
    }
};
