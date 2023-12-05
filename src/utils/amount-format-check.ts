export function amountFormatCheck(v: string) {
  return /^\d+(\.\d+)?$/.test(v);
}
