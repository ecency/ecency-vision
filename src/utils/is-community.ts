export function isCommunity(s: string) {
  return s.match(/^hive-\d+/) !== null;
}
