import numeral from "numeral";

export function formatNumber(num: number | string, precision: number) {
  const format = `0.${"0".repeat(precision)}`;

  return numeral(num).format(format, Math.floor); // round to floor
}
