export default (len: number) => {
    let cLower = "abcdefghijklmnopqrstuvwxyz";
    let cUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let cNumbers = "0123456789";

    let chars = `${cLower}${cUpper}${cNumbers}`;

    let rv = '';

    for (let e = 0; e < len; e++) {
        const b = Math.floor(Math.random() * chars.length);
        rv += chars.substring(b, b + 1)
    }

    return rv;
}
