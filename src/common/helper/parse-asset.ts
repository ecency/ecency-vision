enum Symbol {
    HIVE = 'HIVE',
    HBD = 'HBD',
}

interface Asset {
    amount: number,
    symbol: Symbol
}

export default (strVal: any): Asset => {
    if (typeof strVal !== 'string') {
        // this is temporary during HF24 transition
        return {
            amount: 0,
            symbol: Symbol.HIVE
        }
    }
    const sp = strVal.split(' ');
    return {
        amount: parseFloat(sp[0]),
        symbol: Symbol[sp[1]]
    }
}
