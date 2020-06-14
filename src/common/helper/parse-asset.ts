enum Symbol {
    HIVE = 'HIVE',
    HBD = 'HBD',
}

interface Asset {
    amount: number,
    symbol: Symbol
}

export default (strVal: any): Asset => {
    if(typeof strVal !== 'string'){
       // console.log(strVal);
    }
    const sp = strVal.split(' ');
    return {
        amount: parseFloat(sp[0]),
        symbol: Symbol[sp[1]]
    }
}
