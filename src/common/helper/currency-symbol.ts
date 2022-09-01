const symbolMap = require("currency-symbol-map");

export default (currency: string): string => {
  if (currency === "hbd") {
    return "$";
  }

  return symbolMap(currency);
};
