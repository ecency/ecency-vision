enum Symbol {
    HIVE = 'HIVE',
    HBD = 'HBD',
}

interface Asset {
    amount: number,
    symbol: Symbol
}

export default (strVal: any): Asset => {
    const sp = strVal.split(' ');
    return {
        amount: parseFloat(sp[0]),
        symbol: Symbol[sp[1]]
    }
}
