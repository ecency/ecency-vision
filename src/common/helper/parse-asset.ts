enum Symbol {
    HIVE = 'HIVE',
    HBD = 'HBD',
}

interface Asset {
    value: number,
    symbol: Symbol
}

export default (strVal: any): Asset => {
    const sp = strVal.split(' ');
    return {
        value: parseFloat(sp[0]),
        symbol: Symbol[sp[1]]
    }
}
