export enum Symbol {
    HIVE = 'HIVE',
    HBD = 'HBD',
}

export interface Asset {
    amount: number,
    symbol: Symbol
}

export default (strVal: string): Asset => {

    const sp = strVal.split(' ');
    return {
        amount: parseFloat(sp[0]),
        symbol: Symbol[sp[1]]
    }
}
