export function isSha256(s: string) {
  return /^[a-f0-9]{64}$/gi.test(s);
}
