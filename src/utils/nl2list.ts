export function nl2list(str: string): string[] {
  return str
    .split(/(\r\n|\n\r|\r|\n)/g)
    .map((x) => x.trim())
    .filter((x) => x !== "");
}
