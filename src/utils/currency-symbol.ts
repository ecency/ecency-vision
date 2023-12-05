const symbolMap = require("currency-symbol-map");

export function currencySymbol(currency: string): string {
  if (currency === "hbd") {
    return "$";
  }

  return symbolMap(currency);
}
