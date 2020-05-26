export default (strVal: any) =>
    typeof strVal === 'string'
        ? Number(parseFloat(strVal.split(' ')[0]))
        : strVal;
